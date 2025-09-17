import { create } from "zustand";
import { User } from "../../../domain/entities/user";
import { AuthStatus } from "../../../infrastructure/interfaces/auth.status";
import { authLogin, authValidateToken, authLoginWithDeviceToken } from "../../../actions/auth/auth";
import { StorageAdapter } from "../../../config/adapters/async-storage";
import * as Keychain from 'react-native-keychain';
import { allowMultipleSessionsOptions, disableBiometrics, generateDeviceToken, saveDeviceToken, enableBiometrics, checkMainDevice } from '../../../actions/security/security';

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

    /**
     * Verifica si la autenticación biométrica está habilitada
     */
    static async isBiometricEnabled(): Promise<boolean> {
        try {
            const credentials = await Keychain.getGenericPassword({
                service: KEYCHAIN_SERVICES.BIOMETRIC_ENABLED
            });

            const isEnabled = credentials && typeof credentials !== 'boolean' && credentials.password === 'true';
            console.log(`✅ Biometric status retrieved from Keychain: ${isEnabled}`);
            return isEnabled;
        } catch (error) {
            console.error('❌ Error checking biometric status:', error);
            return false;
        }
    }

    /**
     * Establece el estado de la autenticación biométrica en el Keychain
     */
    static async setBiometricEnabled(enabled: boolean): Promise<boolean> {
        try {
            if (enabled) {
                await Keychain.setGenericPassword(
                    KEYCHAIN_KEYS.BIOMETRIC,
                    'true',
                    {
                        service: KEYCHAIN_SERVICES.BIOMETRIC_ENABLED,
                        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
                    }
                );
                console.log('✅ Biometric enabled flag set to TRUE in Keychain');
            } else {
                await Keychain.setGenericPassword(
                    KEYCHAIN_KEYS.BIOMETRIC,
                    'false',
                    {
                        service: KEYCHAIN_SERVICES.BIOMETRIC_ENABLED,
                        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
                    }
                );
                console.log('✅ Biometric enabled flag set to FALSE in Keychain');
            }
            return true;
        } catch (error) {
            console.error('❌ Error setting biometric status:', error);
            return false;
        }
    }

    /**
     * Obtiene el device token con verificación biométrica
     */
    static async getDeviceTokenWithBiometrics(): Promise<string | null> {
        try {
            // Primero verificar si hay biometría disponible
            const biometryType = await Keychain.getSupportedBiometryType();
            if (!biometryType) {
                console.log('❌ No biometric authentication available on this device');
                return null;
            }

            // Intentar obtener cualquier credencial con verificación biométrica
            // Esto forzará la verificación biométrica
            try {
                await Keychain.setGenericPassword(
                    'device',
                    biometryType,
                    {
                        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
                    }
                );
            } catch (biometricError: any) {
                // Si no existe la credencial, crear una temporal solo para verificación
                if (biometricError?.message?.includes('not found')) {
                    // Crear credencial temporal con biometría
                    await Keychain.setInternetCredentials(
                        'biometric-verification',
                        'temp',
                        'verification',
                        {
                            accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
                        }
                    );

                    // Ahora verificar biometría
                    await Keychain.getInternetCredentials('biometric-verification', {
                        authenticationPrompt: {
                            title: 'Verificación de Seguridad',
                            subtitle: 'Verifica tu identidad para continuar',
                            description: 'Usa tu huella dactilar o Face ID para confirmar esta acción',
                            cancel: 'Cancelar',
                        },
                    });
                } else if (biometricError.message?.includes('Cancel') || biometricError.message?.includes('UserCancel')) {
                    console.log('❌ Usuario canceló la autenticación biométrica');
                    return null;
                } else if (biometricError?.message?.includes('cancelled') || biometricError?.message?.includes('UserCancel')) {
                    console.log('❌ User cancelled biometric verification');
                    return null;
                } else {
                    throw biometricError;
                }
            }

            // Si llegamos aquí, la verificación biométrica fue exitosa
            // Ahora obtener el device token normal
            const credentials = await Keychain.getGenericPassword({
                service: KEYCHAIN_SERVICES.DEVICE_TOKEN,
            });

            if (credentials && typeof credentials !== 'boolean' && credentials.password) {
                console.log('✅ Device token retrieved after biometric verification');
                return credentials.password;
            }

            console.log('❌ No device token found after biometric verification');
            return null;

        } catch (error: any) {
            if (error?.message?.includes('cancelled') || error?.message?.includes('UserCancel')) {
                console.log('❌ User cancelled biometric verification');
            } else {
                console.error('❌ Error during biometric verification:', error);
            }
            return null;
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

    // Método para marcar sesión como expirada sin cambiar estado automáticamente
    markSessionExpired: () => void;

    logout: () => void;

    // Método para extender sesión usando device token
    extendSession: () => Promise<boolean>;

    // Método para obtener device token desde Keychain
    getDeviceToken: () => Promise<string | null>;

    // Método para validar device token guardado en el dispositivo
    getStoredDeviceToken: () => Promise<{ deviceToken: string | null; exists: boolean }>;

    // Nuevos métodos genéricos para Keychain
    getKeychainValue: (service: string) => Promise<string | null>;
    setKeychainValue: (service: string, key: string, value: string, useBiometrics?: boolean) => Promise<boolean>;
    removeKeychainValue: (service: string) => Promise<boolean>;

    // Método para obtener el estado biométrico desde Keychain
    getBiometricStatus: () => Promise<boolean>;

    // Security
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

            const check = await checkMainDevice(existingDeviceToken || '');
            console.log('🔍 Main device check:', check?.isMainDevice ? 'Is main device' : 'Not main device');


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

                    // ✅ Guardar estado biométrico como FALSE en Keychain para nuevos tokens
                    await KeychainManager.setBiometricEnabled(false);

                    console.log('✅ New device token generated and saved');
                } else {
                    console.log('❌ Failed to generate new device token, continuing without it');
                    finalDeviceToken = null;
                }
            } else {
                // El servidor encontró el device token, usar la configuración existente
                console.log('✅ Server found existing device token');
                finalBiometricEnabled = foundDeviceToken.biometricEnabled || false;

                // ✅ Sincronizar estado biométrico con el Keychain
                await KeychainManager.setBiometricEnabled(finalBiometricEnabled);
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

    getBiometricStatus: async () => {
        return await KeychainManager.isBiometricEnabled();
    },

    loginWithBiometrics: async () => {
        try {
            // Primero verificar si la biometría está disponible
            const biometryType = await Keychain.getSupportedBiometryType();
            if (!biometryType) {
                console.log('❌ No biometric authentication available on this device');
                return false;
            }

            console.log('🔐 Biometric type available:', biometryType);

            // Obtener device token normalmente primero
            const deviceToken = await KeychainManager.getDeviceToken();

            if (!deviceToken) {
                console.log('❌ No device token found in Keychain');
                return false;
            }

            // Crear una credencial temporal para verificación biométrica
            const biometricServiceName = 'biometric-login-verification';

            try {
                // Establecer credencial temporal con biometría
                await Keychain.setInternetCredentials(
                    biometricServiceName,
                    'user',
                    'verification',
                    {
                        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
                        authenticationPrompt: {
                            title: 'Iniciar Sesión',
                            subtitle: 'Verifica tu identidad para iniciar sesión',
                            description: 'Usa tu huella dactilar o Face ID para acceder a tu cuenta',
                            cancel: 'Cancelar',
                        },
                    }
                );

                // Verificar biometría accediendo a la credencial
                await Keychain.getInternetCredentials(biometricServiceName, {
                    authenticationPrompt: {
                        title: 'Iniciar Sesión',
                        subtitle: 'Verifica tu identidad para iniciar sesión',
                        description: 'Usa tu huella dactilar o Face ID para acceder a tu cuenta',
                        cancel: 'Cancelar',
                    },
                });

                console.log('✅ Biometric verification successful');

            } catch (biometricError: any) {

                if (biometricError?.message?.includes('cancelled') ||
                    biometricError?.message?.includes('UserCancel') ||
                    biometricError?.message?.includes('Authentication was canceled by the user')) {
                    console.log('❌ User cancelled biometric verification');
                    return false;
                }

                console.log('❌ Biometric verification failed:', biometricError);
                return false;
            }

            console.log('🔐 Attempting biometric login with device token');

            const resp = await authLoginWithDeviceToken(deviceToken);
            if (!resp) {
                console.log('❌ Biometric login failed - token may be invalid');
                return false;
            }

            console.log('✅ Biometric login successful');

            await StorageAdapter.setItem('token', resp.token);

            const foundDeviceToken = resp.user.foundDeviceToken;

            set({
                status: 'authenticated',
                token: resp.token,
                biometricEnabled: foundDeviceToken?.biometricEnabled || false,
                deviceToken: foundDeviceToken?.deviceToken || null,
                user: resp.user
            });
            return true;

        } catch (biometricError: any) {
            if (biometricError?.message?.includes('cancelled') ||
                biometricError?.message?.includes('UserCancel') ||
                biometricError?.message?.includes('Authentication was canceled by the user')) {
                console.log('❌ User cancelled biometric verification');
                return false;
            }
            console.log('❌ Biometric login failed:', biometricError);
            return false;
        }
    },


    checkStatus: async () => {
        const { status: currentStatus } = get();
        const deviceToken = await KeychainManager.getDeviceToken();

        const resp = await authValidateToken(deviceToken || '');

        if (!resp) {
            // ✅ Distinguir entre "no hay token" vs "token expirado"
            const storedToken = await StorageAdapter.getItem('token');

            if (storedToken) {
                // Hay token almacenado pero es inválido/expirado
                console.log('⚠️ Token validation failed - setting status to expired');
                set({ status: 'expired' });
            } else {
                // No hay token almacenado
                console.log('⚠️ No stored token found - setting status to unauthenticated');
                set({ status: 'unauthenticated' });
            }
            return false;
        }

        await StorageAdapter.setItem('token', resp.token);

        set({
            status: 'authenticated',
            token: resp.token,
            biometricEnabled: resp.user.foundDeviceToken?.biometricEnabled || false,
            deviceToken: resp.user.foundDeviceToken?.deviceToken || null,
            user: resp.user
        });
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

    markSessionExpired: () => {
        console.log('⚠️ Marking session as expired - NOT auto-redirecting');
        set({ status: 'expired' });
    },

    extendSession: async () => {
        try {
            console.log('🔄 Attempting to extend session using device token...');

            // Obtener device token desde Keychain
            const deviceToken = await KeychainManager.getDeviceToken();

            if (!deviceToken) {
                console.log('❌ No device token found, cannot extend session');
                return false;
            }

            console.log('🔐 Using device token to extend session');

            // Usar el método existente de login con device token
            const resp = await authLoginWithDeviceToken(deviceToken);

            if (!resp) {
                console.log('❌ Failed to extend session - device token may be invalid');
                return false;
            }

            console.log('✅ Session extended successfully');

            // Guardar el nuevo JWT token
            await StorageAdapter.setItem('token', resp.token);

            const foundDeviceToken = resp.user.foundDeviceToken;

            // Actualizar el estado con la nueva información
            set({
                status: 'authenticated',
                token: resp.token,
                biometricEnabled: foundDeviceToken?.biometricEnabled || false,
                deviceToken: foundDeviceToken?.deviceToken || null,
                user: resp.user
            });

            return true;

        } catch (error: any) {
            console.error('❌ Error extending session:', error);
            return false;
        }
    },


    enableBiometrics: async () => {
        const { user } = get();
        if (!user) return false;

        // Verificar identidad con huella dactilar antes de habilitar biometría
        const existingDeviceToken = await KeychainManager.getDeviceTokenWithBiometrics();

        // Verificar que tenemos un device token y que la verificación biométrica fue exitosa
        if (!existingDeviceToken) {
            //console.error('❌ Biometric verification failed or no device token found, cannot enable biometrics');
            return false;
        }

        try {
            // Llamar a la API de backend para habilitar biometría
            await enableBiometrics(existingDeviceToken);

            // ✅ Guardar estado biométrico como TRUE en Keychain
            await KeychainManager.setBiometricEnabled(true);

            // Actualizar estado local
            set({
                user: { ...user },
                deviceToken: existingDeviceToken,
                biometricEnabled: true,
            });

            console.log('✅ Biometric authentication enabled successfully');
            return true;
        } catch (error: any) {
            if (error.message?.includes('Cancel') || error.message?.includes('UserCancel')) {
                console.log('❌ Usuario canceló la autenticación biométrica');
                return false;
            }
            console.error('❌ Failed to enable biometrics on backend:', error);
            return false;
        }
    },

    disableBiometrics: async () => {
        const { user } = get();
        if (!user) return false;

        // Verificar identidad con huella dactilar antes de deshabilitar biometría
        const existingDeviceToken = await KeychainManager.getDeviceTokenWithBiometrics();

        // Verificar que tenemos un device token y que la verificación biométrica fue exitosa
        if (!existingDeviceToken) {
            console.error('❌ Biometric verification failed or no device token found, cannot disable biometrics');
            return false;
        }

        try {
            // Llamar al backend para deshabilitar biometría
            const success = await disableBiometrics(existingDeviceToken);
            if (success) {
                // ✅ Guardar estado biométrico como FALSE en Keychain
                await KeychainManager.setBiometricEnabled(false);

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
    }



}))
