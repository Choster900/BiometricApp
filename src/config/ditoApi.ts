import { API_URL, API_URL_ANDROID, API_URL_IOS, STAGE } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform, Alert } from "react-native";

// Importar navigation service y store para manejar redirects
let navigationRef: any = null;
let authStore: any = null; // ✅ Referencia al store de auth

/**
 * Función para establecer la referencia de navegación
 * Debe ser llamada desde el componente principal de navegación
 */
const setNavigationRef = (ref: any) => {
    console.log('🔧 Setting navigation ref:', !!ref);
    navigationRef = ref;
    console.log('✅ Navigation ref set successfully');
};

/**
 * Función para establecer la referencia del store de auth
 * Permite hacer logout desde el interceptor
 */
const setAuthStore = (store: any) => {
    console.log('🔧 Setting auth store ref:', !!store);
    authStore = store;
    console.log('✅ Auth store ref set successfully');
};

/**
 * Función para limpiar datos de usuario y redirigir al login
 */
const handleUnauthorized = async () => {
    try {
        console.log('🔍 Navigation ref available:', !!navigationRef);
        console.log('🔍 Auth store available:', !!authStore);
        
        // ✅ Usar el logout del store si está disponible
        if (authStore && authStore.logout) {
            console.log('� Using auth store logout...');
            await authStore.logout();
        } else {
            // Fallback: Limpiar AsyncStorage manualmente
            console.log('� Fallback: Manual cleanup...');
            await AsyncStorage.multiRemove(['token', 'userInfo']);
        }
        
        // Mostrar alerta al usuario
        Alert.alert(
            'Sesión Expirada',
            'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        console.log('🚀 Attempting navigation...');
                        
                        // Intentar diferentes métodos de navegación
                        try {
                            if (navigationRef) {
                                console.log('✅ Navigation ref exists, attempting reset...');
                                
                                // Método 1: Reset directo
                                navigationRef.reset({
                                    index: 0,
                                    routes: [{ name: 'LoginScreen' }],
                                });
                                
                                console.log('✅ Navigation reset completed');
                            } else {
                                console.log('❌ Navigation ref not available');
                            }
                        } catch (navError) {
                            console.error('❌ Navigation error:', navError);
                            
                            // Método alternativo: usar navigate si reset falla
                            try {
                                navigationRef?.navigate?.('LoginScreen');
                                console.log('✅ Fallback navigation completed');
                            } catch (fallbackError) {
                                console.error('❌ Fallback navigation failed:', fallbackError);
                            }
                        }
                    }
                }
            ]
        );
    } catch (error) {
        console.error('❌ Error handling unauthorized:', error);
    }
};

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

// Interceptor para responses - manejar errores y 401s
ditoApi.interceptors.response.use(
    (response) => {
        console.log(`✅ Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        // ✅ Manejar error 401 - redirigir al login
        if (error.response?.status === 401) {
            console.log('🚫 401 Unauthorized - Redirecting to login...');
            await handleUnauthorized();
            
            // Log del error 401 para debugging
            console.log('Error 401 details:', {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || 'Unauthorized',
                data: error.response?.data
            });
        }
        // Manejar otros errores silenciosamente (400, 403)
        else if (error.response?.status === 400 || error.response?.status === 403) {
            console.log('Error (silent):', {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || 'No message',
                data: error.response?.data
            });
        } 
        // Errores de servidor (500s) y otros
        else {
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

export { ditoApi, setNavigationRef, setAuthStore };
