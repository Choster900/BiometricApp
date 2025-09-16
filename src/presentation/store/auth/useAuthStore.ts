import { create } from "zustand";
import { User } from "../../../domain/entities/user";
import { AuthStatus } from "../../../infrastructure/interfaces/auth.status";
import { authLogin, authValidateToken, authLoginWithDeviceToken } from "../../../actions/auth/auth";
import { StorageAdapter } from "../../../config/adapters/async-storage";
import * as Keychain from 'react-native-keychain';
import { allowMultipleSessionsOptions, disableBiometrics, generateDeviceToken, saveDeviceToken, enableBiometrics } from '../../../actions/security/security';

// Constantes para identificar específicamente cada tipo de clave en el Keychain
const KEYCHAIN_SERVICES = {
    DEVICE_TOKEN: 'biometric-app-device-token',
    BIOMETRIC_ENABLED: 'biometric-app-biometric-enabled',
    USER_CREDENTIALS: 'biometric-app-user-credentials'
} as const;

const KEYCHAIN_KEYS = {
    DEVICE: 'device',
    BIOMETRIC: 'biometric',
    USER: 'user'
} as const;


// Utilidades para manejo del Keychain con nombres específicos
class KeychainManager {
    /**
     * Obtiene el device token desde el Keychain de manera segura
     */
    static async getDeviceToken(): Promise<string | null> {
        try {
            const credentials = await Keychain.getGenericPassword({
                service: KEYCHAIN_SERVICES.DEVICE_TOKEN
            });

            if (credentials && typeof credentials !== 'boolean' && credentials.password) {
                console.log('✅ Device token retrieved from Keychain');
                return credentials.password;
            }

            console.log('ℹ️ No device token found in Keychain');
            return null;
        } catch (error) {
            console.error('❌ Error retrieving device token from Keychain:', error);
            return null;
        }
    }

    /**
     * Guarda el device token en el Keychain de manera segura
     */
    static async setDeviceToken(deviceToken: string, useBiometrics: boolean = false): Promise<boolean> {
        try {
            const options: any = {
                service: KEYCHAIN_SERVICES.DEVICE_TOKEN,
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
            };

            /* if (useBiometrics) {
                options.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET;
            } */

            await Keychain.setGenericPassword(
                KEYCHAIN_KEYS.DEVICE,
                deviceToken,
                options
            );

            console.log('✅ Device token saved to Keychain');
            return true;
        } catch (error) {
            console.error('❌ Error saving device token to Keychain:', error);
            return false;
        }
    }

    /**
     * Método genérico para obtener cualquier valor del Keychain por servicio
     */
    static async getKeychainValue(service: string): Promise<string | null> {
        try {
            const credentials = await Keychain.getGenericPassword({ service });

            if (credentials && typeof credentials !== 'boolean' && credentials.password) {
                console.log(`✅ Value retrieved from Keychain service: ${service}`);
                return credentials.password;
            }

            console.log(`ℹ️ No value found in Keychain service: ${service}`);
            return null;
        } catch (error) {
            console.error(`❌ Error retrieving value from Keychain service ${service}:`, error);
            return null;
        }
    }

    /**
     * Método genérico para guardar cualquier valor en el Keychain
     */
    static async setKeychainValue(service: string, key: string, value: string, useBiometrics: boolean = false): Promise<boolean> {
        try {
            const options: any = {
                service,
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
            };

            if (useBiometrics) {
                options.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET;
            }

            await Keychain.setGenericPassword(key, value, options);

            console.log(`✅ Value saved to Keychain service: ${service}`);
            return true;
        } catch (error) {
            console.error(`❌ Error saving value to Keychain service ${service}:`, error);
            return false;
        }
    }

    /**
     * Método para eliminar cualquier valor del Keychain por servicio
     */
    static async removeKeychainValue(service: string): Promise<boolean> {
        try {
            await Keychain.resetGenericPassword({ service });
            console.log(`✅ Value removed from Keychain service: ${service}`);
            return true;
        } catch (error) {
            console.error(`❌ Error removing value from Keychain service ${service}:`, error);
            return false;
        }
    }

}



/**Q
 * Genera y guarda un nuevo device token
 */
async function generateAndSaveNewDeviceToken(): Promise<{ deviceToken: string | null, success: boolean }> {
    try {
        const generated = await generateDeviceToken();
        if (!generated) {
            console.log('❌ Failed to generate device token');
            return { deviceToken: null, success: false };
        }

        const { deviceToken } = generated;

        // Guardar en Keychain
        const keychainSuccess = await KeychainManager.setDeviceToken(deviceToken);
        if (!keychainSuccess) {
            console.error('❌ Failed to save device token to Keychain');
            return { deviceToken: null, success: false };
        }

        // Guardar en backend
        try {
            await saveDeviceToken(deviceToken);
            console.log('✅ Device token saved to backend');
        } catch (error) {
            console.error('❌ Error saving device token to backend:', error);
            // No fallar completamente si el backend falla, el token ya está en Keychain
        }

        return { deviceToken, success: true };
    } catch (error) {
        console.error('❌ Error generating new device token:', error);
        return { deviceToken: null, success: false };
    }
}

export interface AuthState {
    status: AuthStatus;
    token?: string;
    user?: User
    biometricEnabled?: boolean;
    deviceToken?: string | null;

    login: (email: string, password: string) => Promise<boolean>;
    loginWithBiometrics: () => Promise<boolean>;
    enableBiometrics: () => Promise<boolean>;
    checkStatus: () => Promise<boolean>;
    logout: () => void;

    // Método para obtener device token desde Keychain
    getDeviceToken: () => Promise<string | null>;

    // Método para validar device token guardado en el dispositivo
    getStoredDeviceToken: () => Promise<{ deviceToken: string | null; exists: boolean }>;

    // Nuevos métodos genéricos para Keychain
    getKeychainValue: (service: string) => Promise<string | null>;
    setKeychainValue: (service: string, key: string, value: string, useBiometrics?: boolean) => Promise<boolean>;
    removeKeychainValue: (service: string) => Promise<boolean>;

    // Security
    allowMultipleSessionsOptions: (allow: boolean) => Promise<void>;
    disableBiometrics: () => Promise<boolean>; // Cambiado a boolean para indicar éxito/fallo
}


export const useAuthStore = create<AuthState>()((set, get) => ({
    status: 'checking',
    token: undefined,
    user: undefined,
    biometricEnabled: false,
    deviceToken: null,

    login: async (email: string, password: string) => {
        try {
            // Obtener device token guardado en el dispositivo
            const existingDeviceToken = await KeychainManager.getDeviceToken();
            console.log('🔍 Device token from device:', existingDeviceToken ? 'Found' : 'Not found');

            // Intentar login con el device token si existe, sino enviar string vacío
            const resp = await authLogin(email, password, existingDeviceToken || '');

            if (!resp || !resp.token || !resp.user) {
                set({ status: 'unauthenticated', token: undefined, user: undefined });
                return false;
            }

            await StorageAdapter.setItem('token', resp.token);

            let finalDeviceToken = existingDeviceToken;
            let finalBiometricEnabled = false;

            // Verificar si el servidor encontró el device token
            const foundDeviceToken = resp.user.foundDeviceToken;
            console.log('🔍 Server foundDeviceToken:', foundDeviceToken);

            if (!foundDeviceToken) {
                // El servidor no encontró el device token, crear uno nuevo
                console.log('⚠️ Server foundDeviceToken is null, generating new device token');

                const { deviceToken: newDeviceToken, success } = await generateAndSaveNewDeviceToken();
                if (success && newDeviceToken) {
                    finalDeviceToken = newDeviceToken;
                    finalBiometricEnabled = false; // Los nuevos tokens inician sin biometría
                    console.log('✅ New device token generated and saved');
                } else {
                    console.log('❌ Failed to generate new device token, continuing without it');
                    finalDeviceToken = null;
                }
            } else {
                // El servidor encontró el device token, usar la configuración existente
                console.log('✅ Server found existing device token');
                finalBiometricEnabled = foundDeviceToken.biometricEnabled || false;

            }

            set({
                status: 'authenticated',
                token: resp.token,
                biometricEnabled: finalBiometricEnabled,
                deviceToken: finalDeviceToken,
                user: resp.user
            });

            return true;

        } catch (error: any) {
            console.error('❌ Error during login:', error);

            // En caso de error, continuar con login básico sin device token
            try {
                const resp = await authLogin(email, password, '');

                if (resp && resp.token && resp.user) {
                    await StorageAdapter.setItem('token', resp.token);
                    set({
                        status: 'authenticated',
                        token: resp.token,
                        biometricEnabled: false,
                        deviceToken: null,
                        user: resp.user
                    });
                    return true;
                }
            } catch (fallbackError) {
                console.error('❌ Fallback login also failed:', fallbackError);
            }

            set({ status: 'unauthenticated', token: undefined, user: undefined });
            return false;
        }
    },

    getDeviceToken: async () => {
        return await KeychainManager.getDeviceToken();
    },

    getStoredDeviceToken: async () => {
        try {
            // Obtener device token guardado en el dispositivo
            const storedToken = await KeychainManager.getDeviceToken();

            if (storedToken) {
                console.log('✅ Device token found in device storage');
                return {
                    deviceToken: storedToken,
                    exists: true
                };
            } else {
                console.log('ℹ️ No device token found in device storage');
                return {
                    deviceToken: null,
                    exists: false
                };
            }
        } catch (error) {
            console.error('❌ Error retrieving stored device token:', error);
            return {
                deviceToken: null,
                exists: false
            };
        }
    },

    // Métodos genéricos para manejar valores del Keychain
    getKeychainValue: async (service: string) => {
        return await KeychainManager.getKeychainValue(service);
    },

    setKeychainValue: async (service: string, key: string, value: string, useBiometrics: boolean = false) => {
        return await KeychainManager.setKeychainValue(service, key, value, useBiometrics);
    },

    removeKeychainValue: async (service: string) => {
        return await KeychainManager.removeKeychainValue(service);
    },

    loginWithBiometrics: async () => {
        try {
            // Usar el método dedicado del KeychainManager para obtener con biometría
            const deviceToken = await KeychainManager.getDeviceToken();

            if (!deviceToken) {
                console.log('❌ No device token found in Keychain');
                return false;
            }

            console.log('🔐 Attempting biometric login with device token:', deviceToken);

            const resp = await authLoginWithDeviceToken(deviceToken);
            if (!resp) {
                console.log('❌ Biometric login failed - token may be invalid');
                return false;
            }

            // Validar si el device token usado sigue siendo activo después del login
            const isTokenStillActive = (resp.user as any).allDeviceSessions?.some(
                (session: any) => session.deviceToken === deviceToken && session.isActive
            );

            if (!isTokenStillActive) {
                console.log('⚠️ Device token is no longer active, clearing from Keychain');
                //   await KeychainManager.removeDeviceToken();
                // Aún permitir el login ya que fue exitoso, pero limpiar el token inactivo
            } else {
                console.log('✅ Device token is still active');
            }

            await StorageAdapter.setItem('token', resp.token);

            set({
                status: 'authenticated',
                token: resp.token,
                user: resp.user,
                deviceToken: isTokenStillActive ? deviceToken : null,
                biometricEnabled: false
            });

            return true;

        } catch (e) {
            console.log('❌ Biometric login failed:', e);
            return false;
        }
    },


    checkStatus: async () => {

        const resp = await authValidateToken();

        if (!resp) {
            set({ status: 'unauthenticated', token: undefined, user: undefined });
            return false;
        }

        await StorageAdapter.setItem('token', resp.token);

        // Debug: verificar si allowMultipleSessions está presente
        console.log('🔍 User data from checkStatus:', resp.user);
        console.log('🔍 allowMultipleSessions value:', (resp.user as any).allowMultipleSessions);

        set({ status: 'authenticated', token: resp.token, user: resp.user });

        return true;

    },

    logout: async () => {
        await StorageAdapter.removeItem('token');

        // aunque se deslogee no quiero que se elimine el device token

        set({
            status: 'unauthenticated',
            token: undefined,
            user: undefined,
            biometricEnabled: false,
            deviceToken: null
        });
    },


    enableBiometrics: async () => {
        const { user } = get();
        if (!user) return false;

        const existingDeviceToken = await KeychainManager.getDeviceToken();
        if (!existingDeviceToken) return false;

        try {
            await Keychain.setGenericPassword(
                'device',
                existingDeviceToken,
                {
                    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
                }
            );

            await enableBiometrics(existingDeviceToken);

            set({
                user: { ...user },
                deviceToken: existingDeviceToken,
                biometricEnabled: true,
            });

            return true; // ✅ operación exitosa
        } catch (error: any) {
            if (error.message?.includes('Cancel') || error.message?.includes('UserCancel')) {
                console.log('❌ Usuario canceló la autenticación biométrica');
                return false; // ❌ operación cancelada
            }
            console.error('❌ Failed to enable biometrics on backend:', error);
            return false;
        }
    },

    disableBiometrics: async () => {
        const { user } = get();
        if (!user) return false;

        const existingDeviceToken = await KeychainManager.getDeviceToken();

        // Verificar que tenemos un device token
        if (!existingDeviceToken) {
            console.error('❌ No device token found, cannot enable biometrics');
            return false;
        }

        try {

            // Llamar al backend para deshabilitar biometría
            const success = await disableBiometrics(existingDeviceToken);
            if (success) {
                // Actualizar configuración local de biometría
                //  await KeychainManager.setBiometricEnabled(false);

                // Actualizar estado local
                set({
                    user: { ...user },
                    biometricEnabled: false
                });

                console.log('✅ Biometric authentication disabled successfully');
                return true;
            } else {
                console.log('❌ Failed to disable biometrics on backend');
                return false;
            }

        } catch (error: any) {
            console.error('❌ Error durante la verificación/deshabilitación biométrica:', error);

            // Si el error es por cancelación del usuario, retornar false sin loggear como error
            if (error?.message?.includes('cancelled') || error?.message?.includes('UserCancel')) {
                console.log('❌ Usuario canceló la verificación biométrica');
                return false;
            }

            return false;
        }
    },

    allowMultipleSessionsOptions: async (allow: boolean) => {
        try {
            const { user } = get();
            if (!user) {
                console.log('❌ No user found in state');
                return;
            }

            // Obtener device token usando el método optimizado
            const storedDeviceToken = await KeychainManager.getDeviceToken();

            // Verificar si tenemos un device token válido
            if (!storedDeviceToken) {
                console.error('❌ Cannot update multiple sessions setting: No device token available');
                throw new Error('Device token required for this operation');
            }

            await allowMultipleSessionsOptions(allow, storedDeviceToken);
            console.log(`✅ Multiple sessions ${allow ? 'enabled' : 'disabled'} successfully`);

            // Actualizar el estado local
            set({ user: { ...user, allowMultipleSessions: allow } as any });

        } catch (error) {
            console.error('❌ Error updating multiple sessions setting:', error);
            throw error; // Re-throw para que el componente pueda manejar el error
        }
    },



}))
