import { ditoApi } from "../../config/ditoApi";

interface GenerateDeviceTokenResponse {
    deviceToken: string;
    message: string;
    note: string;
}

interface SetMainDeviceResponse {
    deviceToken: string;
    isMainDevice: true;
    message: string;
    requiresConfirmation: false;

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

export const allowMultipleSessionsOptions = async (allow: boolean): Promise<string | null> => {
    try {
        const { data } = await ditoApi.post<string>('/auth/allow-multiple-sessions', { allow });
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



export const disableBiometrics = async (): Promise<boolean> => {
    try {
        await ditoApi.post('/auth/disable-biometrics');
        console.log('Biometrics disabled successfully');
        return true;
    } catch (error: any) {
        let message = 'Error deshabilitando biometría.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Disable biometrics error:', message, error);
        return false;
    }
};

export const setMainDevice = async (deviceToken: string): Promise<SetMainDeviceResponse | null> => {
    try {
        const { data } = await ditoApi.post<SetMainDeviceResponse>('/auth/set-main-device', { deviceToken });
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
