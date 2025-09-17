import { create } from 'zustand';
import { User } from '../../../domain/entities/user';
import { AuthStatus } from '../../../infrastructure/interfaces/auth.status';
import { authLogin, authValidateToken, authLoginWithDeviceToken } from '../../../actions/auth/auth';
import { StorageAdapter } from '../../../config/adapters/async-storage';
import * as Keychain from 'react-native-keychain';
import { disableBiometrics, generateDeviceToken, saveDeviceToken, enableBiometrics, checkMainDevice } from '../../../actions/security/security';

// =============================
// Constantes Keychain
// =============================
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


// =============================
// Keychain Utilities
// =============================
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
    static async setDeviceToken(deviceToken: string): Promise<boolean> {
        try {
            const options = {
                service: KEYCHAIN_SERVICES.DEVICE_TOKEN,
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
            } as const;
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
            const biometryType = await Keychain.getSupportedBiometryType();
            if (!biometryType) {
                console.log('❌ No hay autenticación biométrica disponible en este dispositivo');
                return null;
            }
            // Usamos una credencial temporal para forzar el prompt biométrico
            const tempService = 'biometric-device-token-check';
            try {
                await Keychain.setInternetCredentials(
                    tempService,
                    'temp',
                    'verification',
                    {
                        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
                        authenticationPrompt: {
                            title: 'Verificación',
                            subtitle: 'Confirma tu identidad',
                            description: 'Autentícate para continuar',
                            cancel: 'Cancelar'
                        }
                    }
                );
                await Keychain.getInternetCredentials(tempService, {
                    authenticationPrompt: {
                        title: 'Verificación',
                        subtitle: 'Confirma tu identidad',
                        description: 'Autentícate para continuar',
                        cancel: 'Cancelar'
                    }
                });
            } catch (biometricError: any) {
                if (biometricError?.message?.includes('cancel') || biometricError.message?.includes('Cancelar')) {
                    console.log('❌ Usuario canceló verificación biométrica');
                    return null;
                }
                console.error('❌ Error en verificación biométrica:', biometricError);
                return null;
            }

            const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICES.DEVICE_TOKEN });
            if (credentials && typeof credentials !== 'boolean' && credentials.password) return credentials.password;
            console.log('❌ No se encontró device token tras verificación');
            return null;
        } catch (error: any) {
            if (!error?.message?.includes('cancel')) console.error('❌ Error general verificación biométrica:', error);
            return null;
        }
    }

}



/**Q
 * Genera y guarda un nuevo device token
 */
async function generateAndSaveNewDeviceToken(): Promise<{ deviceToken: string | null; success: boolean }> {
    try {
        const generated = await generateDeviceToken();
        if (!generated) {
            console.log('❌ Failed to generate device token');
            return { deviceToken: null, success: false };
        }

        const { deviceToken } = generated;
        const keychainSuccess = await KeychainManager.setDeviceToken(deviceToken);
        if (!keychainSuccess) {
            console.error('❌ Failed to save device token to Keychain');
            return { deviceToken: null, success: false };
        }
        try {
            await saveDeviceToken(deviceToken);
            console.log('✅ Device token saved to backend');
        } catch (error) {
            console.error('❌ Error saving device token to backend:', error);
        }

        return { deviceToken, success: true };
    } catch (error) {
        console.error('❌ Error generating new device token:', error);
        return { deviceToken: null, success: false };
    }
}

// =============================
// Helpers
// =============================
interface AuthResponse {
    token: string;
    user: User & { foundDeviceToken?: { biometricEnabled?: boolean; deviceToken?: string | null } };
}

async function applyAuthResponse(resp: AuthResponse, set: any) {
    await StorageAdapter.setItem('token', resp.token);
    set({
        status: 'authenticated',
        token: resp.token,
        biometricEnabled: resp.user.foundDeviceToken?.biometricEnabled || false,
        deviceToken: resp.user.foundDeviceToken?.deviceToken || null,
        user: resp.user
    });
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
            const existingDeviceToken = await KeychainManager.getDeviceToken();
            const resp = await authLogin(email, password, existingDeviceToken || '');

            if (!resp || !resp.token || !resp.user) {
                set({ status: 'unauthenticated', token: undefined, user: undefined });
                return false;
            }
            await StorageAdapter.setItem('token', resp.token);
            const check = await checkMainDevice(existingDeviceToken || '');
            let finalDeviceToken = existingDeviceToken;
            let finalBiometricEnabled = false;
            const foundDeviceToken = resp.user.foundDeviceToken;
            if (!foundDeviceToken) {
                const { deviceToken: newDeviceToken, success } = await generateAndSaveNewDeviceToken();
                if (success && newDeviceToken) {
                    finalDeviceToken = newDeviceToken;
                    finalBiometricEnabled = false; // Los nuevos tokens inician sin biometría
                    await KeychainManager.setBiometricEnabled(false);
                } else {
                    finalDeviceToken = null;
                }
            } else {
                finalBiometricEnabled = foundDeviceToken.biometricEnabled || false;
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
            console.error('❌ Error durante login principal, intentando fallback simple:', error);
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
            const storedToken = await KeychainManager.getDeviceToken();

            if (storedToken) {
                return {
                    deviceToken: storedToken,
                    exists: true
                };
            } else {
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
            const biometryType = await Keychain.getSupportedBiometryType();
            if (!biometryType) {
                console.log('❌ No biometric authentication available on this device');
                return false;
            }
            const deviceToken = await KeychainManager.getDeviceToken();
            if (!deviceToken) {
                console.log('❌ No device token found in Keychain');
                return false;
            }
            const biometricServiceName = 'biometric-login-verification';

            try {
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

                await Keychain.getInternetCredentials(biometricServiceName, {
                    authenticationPrompt: {
                        title: 'Iniciar Sesión',
                        subtitle: 'Verifica tu identidad para iniciar sesión',
                        description: 'Usa tu huella dactilar o Face ID para acceder a tu cuenta',
                        cancel: 'Cancelar',
                    },
                });

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
            const resp = await authLoginWithDeviceToken(deviceToken);
            if (!resp) {
                console.log('❌ Biometric login failed - token may be invalid');
                return false;
            }
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
            const storedToken = await StorageAdapter.getItem('token');

            if (storedToken) {
                set({ status: 'expired' });
            } else {
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
        set({
            status: 'unauthenticated',
            token: undefined,
            user: undefined,
            biometricEnabled: false,
            deviceToken: null
        });
    },

    markSessionExpired: () => {
        set({ status: 'expired' });
    },

    extendSession: async () => {
        try {
            const deviceToken = await KeychainManager.getDeviceToken();

            if (!deviceToken) {
                console.log('❌ No device token found, cannot extend session');
                return false;
            }
            const resp = await authLoginWithDeviceToken(deviceToken);

            if (!resp) {
                console.log('❌ Failed to extend session - device token may be invalid');
                return false;
            }
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

        } catch (error: any) {
            console.error('❌ Error extending session:', error);
            return false;
        }
    },


    enableBiometrics: async () => {
        const { user } = get();
        if (!user) return false;

        const existingDeviceToken = await KeychainManager.getDeviceTokenWithBiometrics();
        if (!existingDeviceToken) {
            return false;
        }

        try {
            await enableBiometrics(existingDeviceToken);
            await KeychainManager.setBiometricEnabled(true);
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

        const existingDeviceToken = await KeychainManager.getDeviceTokenWithBiometrics();
        if (!existingDeviceToken) {
            return false;
        }

        try {
            const success = await disableBiometrics(existingDeviceToken);
            if (success) {
                await KeychainManager.setBiometricEnabled(false);
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
            if (error?.message?.includes('cancelled') || error?.message?.includes('UserCancel')) {
                console.log('❌ Usuario canceló la verificación biométrica');
                return false;
            }

            return false;
        }
    }



}))
