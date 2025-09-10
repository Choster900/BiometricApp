import { create } from "zustand";
import { User } from "../../../domain/entities/user";
import { AuthStatus } from "../../../infrastructure/interfaces/auth.status";
import { authLogin, authValidateToken, authLoginWithDeviceToken, authEnableBiometrics } from "../../../actions/auth/auth";
import { StorageAdapter } from "../../../config/adapters/async-storage";
import * as Keychain from 'react-native-keychain';



export interface AuthState {
    status: AuthStatus;
    token?: string;
    user?: User


    login: (email: string, password: string) => Promise<boolean>;
    loginWithBiometrics: () => Promise<boolean>;
    enableBiometrics: () => Promise<void>;
    checkStatus: () => Promise<boolean>;
    logout: () => void;
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

        // TODO: guardar en el storage el token

        await StorageAdapter.setItem('token', resp.token);



        set({ status: 'authenticated', token: resp.token, user: resp.user });

        return true;

    },

    // 🔹 login usando biometría
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

    // 🔹 habilitar biometría después del login normal
    enableBiometrics: async () => {
        const { user } = get();
        if (!user) return;

        const resp = await authEnableBiometrics();
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
        console.log(resp)

        set({ user: { ...user, biometricEnabled: true } });
    },

    checkStatus: async () => {


        const resp = await authValidateToken();

        if (!resp) {
            set({ status: 'unauthenticated', token: undefined, user: undefined });
            return false;
        }

        await StorageAdapter.setItem('token', resp.token);

        set({ status: 'authenticated', token: resp.token, user: resp.user });

        return true;

    },

    logout: async () => {
        await StorageAdapter.removeItem('token');
        set({ status: 'unauthenticated', token: undefined, user: undefined });
    }

}))
