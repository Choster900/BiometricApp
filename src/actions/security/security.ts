import { ditoApi } from "../../config/ditoApi";
import { CheckMainDeviceResponse } from "../../infrastructure/interfaces/check-main-device.response";

interface GenerateDeviceTokenResponse {
    deviceToken: string;
    message: string;
    note: string;
}

export const generateDeviceToken = async (): Promise<GenerateDeviceTokenResponse | null> => {
    try {
        const { data } = await ditoApi.post<GenerateDeviceTokenResponse>('/auth/generate-device-token');
        return data;
    } catch (error: any) {
        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
            console.log('Generate device token: Authentication error (silent)');
            return null;
        }

        let message = 'Error generando token de dispositivo.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Generate device token error:', message, error);
        return null;
    }
};

export const saveDeviceToken = async (deviceToken: string): Promise<boolean> => {
    try {
        await ditoApi.post('/auth/save-device-token', { deviceToken });
        return true;
    } catch (error: any) {
        let message = 'Error guardando token de dispositivo.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Save device token error:', message, error);
        return false;
    }
};

export const allowMultipleSessionsOptions = async (allow: boolean, currentDeviceToken: string): Promise<string | null> => {
    try {
        const { data } = await ditoApi.post<string>('/auth/allow-multiple-sessions', { allow, currentDeviceToken });
        console.log('Multiple sessions updated:', data);
        return data;
    } catch (error: any) {
        let message = 'Error actualizando configuración de sesiones múltiples.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Allow multiple sessions error:', message, error);
        return null;
    }
};

export const enableBiometrics = async (deviceToken: string): Promise<boolean> => {
    try {
        await ditoApi.post('/auth/enable-biometrics', { deviceToken });
        console.log('Biometrics enabled successfully');
        return true;
    } catch (error: any) {
        let message = 'Error habilitando biometría.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Enable biometrics error:', message, error);
        return false;
    }
};

export const disableBiometrics = async (deviceToken: string): Promise<boolean> => {
    try {
        await ditoApi.post('/auth/disable-biometrics', { deviceToken });
        console.log('Biometrics disabled successfully');
        return true;
    } catch (error: any) {
        let message = 'Error deshabilitando biometría.';

        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
            console.log('Login auth error (silent)');
            return false;
        }
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Disable biometrics error:', message, error);
        return false;
    }
};


export const checkMainDevice = async (deviceToken: string): Promise<CheckMainDeviceResponse | null> => {
    try {
        const { data } = await ditoApi.post('/auth/check-main-device', { deviceToken });
        return data;
    } catch (error: any) {
        let message = 'Error verificando dispositivo principal.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Check main device error:', message, error);
        return null;
    }
};
