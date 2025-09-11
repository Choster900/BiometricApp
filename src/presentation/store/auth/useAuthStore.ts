import { create } from "zustand";
import { User } from "../../../domain/entities/user";
import { AuthStatus } from "../../../infrastructure/interfaces/auth.status";
import { authLogin, authValidateToken, authLoginWithDeviceToken } from "../../../actions/auth/auth";
import { StorageAdapter } from "../../../config/adapters/async-storage";
import * as Keychain from 'react-native-keychain';
import { allowMultipleSessionsOptions, disableBiometrics, generateDeviceToken, saveDeviceToken } from '../../../actions/security/security';



export interface AuthState {
    status: AuthStatus;
    token?: string;
    user?: User


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


    login: async (email: string, password: string) => {

        const resp = await authLogin(email, password);

        if (!resp) {
            set({ status: 'unauthenticated', token: undefined, user: undefined });

            return false;
        }


        await StorageAdapter.setItem('token', resp.token);


        set({ status: 'authenticated', token: resp.token, user: resp.user });

        return true;

    },

    loginWithBiometrics: async () => {
        try {
            const credentials = await Keychain.getGenericPassword();
            if (!credentials) return false;

            const deviceToken = credentials.password;
            console.log(deviceToken)

            const resp = await authLoginWithDeviceToken(deviceToken);
            if (!resp) return false;

            await StorageAdapter.setItem('token', resp.token);

            set({ status: 'authenticated', token: resp.token, user: resp.user });
            return true;

        } catch (e) {
            console.log("Biometric login failed:", e);
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
                accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
            }
        );

        await saveDeviceToken(deviceToken);

        set({ user: { ...user, biometricEnabled: true } });
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

        const { user } = get();
        if (!user) return;

        await allowMultipleSessionsOptions(allow);

        set({ user: { ...user, allowMultipleSessions: allow } });

    },

    disableBiometrics: async () => {
        const { user } = get();
        if (!user) return false;

        try {
            const credentials = await Keychain.getGenericPassword({
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
                set({ user: { ...user, biometricEnabled: false, deviceToken: null } });

                // Limpiar las credenciales almacenadas
                await Keychain.resetGenericPassword();
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
