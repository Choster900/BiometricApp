import { ditoApi } from "../../config/ditoApi";
import { User } from "../../domain/entities/user";
import { LoginResponse } from "../../infrastructure/interfaces/auth.responses";


const returnUserToken = (data: LoginResponse) => {

    const user: User = {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        isActive: data.isActive,
        roles: data.roles,
        biometricEnabled: data.biometricEnabled ?? false,
        deviceToken: data.deviceToken,
        allowMultipleSessions: data.allowMultipleSessions ?? false, // Valor por defecto
    }

    return { user, token: data.token };

}


export const authLogin = async (email: string, password: string) => {
    email = email.toLowerCase().trim();
    try {
        const { data } = await ditoApi.post<LoginResponse>('/auth/login', { email, password });
        return returnUserToken(data);
    } catch (error: any) {

        // Si es error de autenticación (400, 401, 403), no mostrar error
        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
            console.log('Token validation: No valid token found (silent)');
            return null;
        }

        let message = 'Ocurrió un error al iniciar sesión.';
        if (error.response && error.response.data && error.response.data.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Login error:', message, error);
        throw new Error(message);
    }
};

export const authValidateToken = async (): Promise<{ user: User, token: string } | null> => {
    try {
        const { data } = await ditoApi.get<LoginResponse>('/auth/check-status');
        return returnUserToken(data);
    } catch (error: any) {
        // Si es error de autenticación (400, 401, 403), no mostrar error
        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
            console.log('Token validation: No valid token found (silent)');
            return null;
        }

        // Para otros errores sí mostrar el log
        let message = 'Error validando el token.';
        if (error.response && error.response.data && error.response.data.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Token validation error:', message, error);
        return null;
    }
};

// 🔹 nuevo: login usando el deviceToken
export const authLoginWithDeviceToken = async (deviceToken: string): Promise<{ user: User, token: string } | null> => {
    try {
        const { data } = await ditoApi.post<LoginResponse>('/auth/login-with-device-token', { deviceToken });
        return returnUserToken(data);
    } catch (error: any) {
        let message = 'Error en login biométrico.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Biometric login error:', message, error);
        return null;
    }
};
