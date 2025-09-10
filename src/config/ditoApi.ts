import { API_URL, API_URL_ANDROID, API_URL_IOS, STAGE } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

/**
 * Función para obtener la URL base según el entorno y plataforma
 */
const getBaseUrl = (): string => {
    if (STAGE === "production") {
        return API_URL;
    }

    return Platform.OS === "ios" ? API_URL_IOS : API_URL_ANDROID;
};

export const DITO_API_BASE_URL = getBaseUrl();

/**
 * Instancia de Axios configurada para la API de Dito
 */
const ditoApi = axios.create({
    baseURL: DITO_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para requests - agregar token automáticamente
ditoApi.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');

        if (token) {
            config.headers!['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para responses - manejar errores silenciosamente
ditoApi.interceptors.response.use(
    (response) => {
        console.log(`✅ Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
            console.log('Error (silent):', {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || 'No message',
                data: error.response?.data
            });
        } else {
            console.error('❌ Response Error:', {
                status: error.response?.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
                fullError: error
            });
        }
        return Promise.reject(error);
    }
);

export { ditoApi };
