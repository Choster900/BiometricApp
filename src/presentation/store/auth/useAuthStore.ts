import { create } from "zustand";
import { User } from "../../../domain/entities/user";
import { AuthStatus } from "../../../infrastructure/interfaces/auth.status";
import { authLogin, authValidateToken, authLoginWithDeviceToken } from "../../../actions/auth/auth";
import { StorageAdapter } from "../../../config/adapters/async-storage";
import * as Keychain from 'react-native-keychain';
import { allowMultipleSessionsOptions, disableBiometrics, generateDeviceToken, saveDeviceToken, enableBiometrics } from '../../../actions/security/security';



export interface AuthState {
    status: AuthStatus;
    token?: string;
    user?: User
    biometricEnabled?: boolean;
    deviceToken?: string | null;

    login: (email: string, password: string) => Promise<boolean>;
    loginWithBiometrics: () => Promise<boolean>;
    enableBiometrics: () => Promise<void>;
    checkStatus: () => Promise<boolean>;
    logout: () => void;

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

        const resp = await authLogin(email, password);

        if (!resp) {
            set({ status: 'unauthenticated', token: undefined, user: undefined });
            return false;
        }

        await StorageAdapter.setItem('token', resp.token);

        let deviceTokenValue = null;
        let biometricEnabledValue = false;
        try {
            const existingCredentials = await Keychain.getGenericPassword({ service: 'device-token' });
            if (existingCredentials && existingCredentials.password) {
                const storedDeviceToken = existingCredentials.password;

                console.log('🔍 Stored device token:', storedDeviceToken);
                console.log('🔍 All device sessions:', resp.user.allDeviceSessions);

                // 🔹 Buscar si el device token existe en la base de datos
                const tokenInDatabase = resp.user.allDeviceSessions?.find(
                    (session: any) => session.deviceToken === storedDeviceToken
                );

                if (!tokenInDatabase) {
                    // Token NO existe en la base de datos → Borrar y crear nuevo
                    console.log('⚠️ Device token NOT FOUND in database, clearing and will generate new one');
                    await Keychain.resetGenericPassword({ service: 'device-token' });
                    await Keychain.resetGenericPassword({ service: 'biometric-enabled' });
                    // deviceTokenValue permanece null para generar uno nuevo
                } else if (tokenInDatabase.isActive !== true) {
                    // Token existe pero está INACTIVO → Rechazar login pero conservar token
                    console.log('❌ Device token exists but is INACTIVE - keeping token in Keychain');
                    console.log('❌ Stored token:', storedDeviceToken);
                    console.log('❌ Token status in DB:', tokenInDatabase);

                    // NO borrar el token del Keychain - solo rechazar login
                    // El token puede ser reactivado más tarde y queremos conservarlo

                    set({ status: 'unauthenticated', token: undefined, user: undefined });
                    return false;
                }else {
                    // Token existe y está ACTIVO → Permitir login
                    console.log('✅ Device token exists and is ACTIVE');

                    // Obtener configuración de biometría
                    biometricEnabledValue = tokenInDatabase.biometricEnabled ?? false;

                    if (biometricEnabledValue) {
                        console.log('✅ Biometric authentication is enabled for this device');
                        await Keychain.setGenericPassword(
                            'biometric',
                            'true',
                            {
                                service: 'biometric-enabled',
                                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
                            }
                        );
                    } else {
                        console.log('⚠️ Biometric authentication is disabled for this device');
                        await Keychain.resetGenericPassword({ service: 'biometric-enabled' });
                    }

                    // Usar el token existente
                    deviceTokenValue = storedDeviceToken;
                    console.log('✅ Using existing ACTIVE device token from secure storage');
                }
            } else {
                console.log('ℹ️ No device token found in Keychain, will generate new one');
            }
        } catch (error) {
            console.log('❌ Error checking existing device token:', error);
        }

        // Si no tenemos device token, generar uno nuevo
        if (!deviceTokenValue) {
            const generated = await generateDeviceToken();
            if (!generated) {
                console.log('❌ Failed to generate device token');
                // Continuar sin device token por ahora
                set({ status: 'authenticated', token: resp.token, user: resp.user });
                return true;
            }

            deviceTokenValue = generated.deviceToken;

            try {
                await Keychain.setGenericPassword(
                    'device',
                    deviceTokenValue,
                    {
                        service: 'device-token',
                        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
                    }
                );
                console.log('✅ Device token saved to Keychain');
            } catch (error) {
                console.error('❌ Error saving device token to Keychain:', error);
            }

            try {
                await saveDeviceToken(deviceTokenValue);
            } catch (error) {
                console.error('❌ Error saving device token to backend:', error);
            }
        }

        set({
            status: 'authenticated',
            token: resp.token,
            biometricEnabled: biometricEnabledValue,
            deviceToken: deviceTokenValue,
            user: {
                ...resp.user,
                //deviceToken: deviceTokenValue
            }
        });

        return true;

    },

    loginWithBiometrics: async () => {
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'device-token' });
            if (!credentials) {
                console.log('❌ No credentials found in Keychain');
                return false;
            }

            const deviceToken = credentials.password;
            console.log('🔐 Attempting biometric login with device token:', deviceToken);

            const resp = await authLoginWithDeviceToken(deviceToken);
            if (!resp) {
                console.log('❌ Biometric login failed - token may be invalid');
                return false;
            }

            // 🔹 Validar si el device token usado sigue siendo activo después del login
            const isTokenStillActive = resp.user.allDeviceSessions?.some(
                (session: any) => session.deviceToken === deviceToken && session.isActive
            );

            if (!isTokenStillActive) {
                console.log('⚠️ Device token is no longer active, clearing from Keychain');
                await Keychain.resetGenericPassword({ service: 'device-token' });
                // Aún permitir el login ya que fue exitoso, pero limpiar el token inactivo
            } else {
                console.log('✅ Device token is still active');
            }

            await StorageAdapter.setItem('token', resp.token);

            set({ status: 'authenticated', token: resp.token, user: resp.user });
            return true;

        } catch (e) {
            console.log('❌ Biometric login failed:', e);
            return false;
        }
    },

    enableBiometrics: async () => {
        const { user } = get();
        if (!user) return;

        const resp = await generateDeviceToken();
        if (!resp) return;

        const { deviceToken } = resp;


        await Keychain.setGenericPassword(
            'device',
            deviceToken,
            {
                service: 'device-token',
                accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
            }
        );

        //await saveDeviceToken(deviceToken);

        // Llamar a la API de backend para habilitar biometría
        await enableBiometrics(deviceToken);

        set({ user: { ...user/* , biometricEnabled: true */ } });
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
        console.log('🔍 allowMultipleSessions value:', resp.user.allowMultipleSessions);

        set({ status: 'authenticated', token: resp.token, user: resp.user });

        return true;

    },

    logout: async () => {
        await StorageAdapter.removeItem('token');
        set({ status: 'unauthenticated', token: undefined, user: undefined });
    },

    allowMultipleSessionsOptions: async (allow: boolean) => {
        try {
            const { user } = get();
            if (!user) {
                console.log('❌ No user found in state');
                return;
            }

            // Obtener device token del Keychain
            let storedDeviceToken: string | null = null;
            try {
                const existingCredentials = await Keychain.getGenericPassword({ service: 'device-token' });
                if (existingCredentials && typeof existingCredentials !== 'boolean' && existingCredentials.password) {
                    storedDeviceToken = existingCredentials.password;
                } else {
                    console.log('⚠️ No device token found in Keychain');
                }
            } catch (keychainError) {
                console.error('❌ Error accessing Keychain:', keychainError);
            }

            // Verificar si tenemos un device token válido
            if (!storedDeviceToken) {
                console.error('❌ Cannot update multiple sessions setting: No device token available');
                throw new Error('Device token required for this operation');
            }

            await allowMultipleSessionsOptions(allow, storedDeviceToken);
            console.log(`✅ Multiple sessions ${allow ? 'enabled' : 'disabled'} successfully`);

            // Actualizar el estado local
            set({ user: { ...user, allowMultipleSessions: allow } });

        } catch (error) {
            console.error('❌ Error updating multiple sessions setting:', error);
            throw error; // Re-throw para que el componente pueda manejar el error
        }
    },

    disableBiometrics: async () => {
        const { user } = get();
        if (!user) return false;

        try {
            const credentials = await Keychain.getGenericPassword({
                service: 'device-token',
                authenticationPrompt: {
                    title: 'Verificación de Seguridad',
                    subtitle: 'Verifica tu identidad para deshabilitar la autenticación biométrica',
                    description: 'Usa tu huella dactilar o Face ID para confirmar esta acción',
                    cancel: 'Cancelar',
                },
            });

            if (!credentials) {
                console.log('❌ Verificación biométrica cancelada o fallida');
                return false;
            }


            const success = await disableBiometrics();
            if (success) {
                set({ user: { ...user,/*  biometricEnabled: false, deviceToken: null */ } });

                // Limpiar las credenciales almacenadas
                await Keychain.resetGenericPassword({ service: 'device-token' });
                await Keychain.resetGenericPassword({ service: 'biometric-enabled' });
                return true;
            } else {
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
