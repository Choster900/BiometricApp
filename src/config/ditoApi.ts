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
    navigationRef = ref;
};

/**
 * Función para establecer la referencia del store de auth
 * Permite hacer logout desde el interceptor
 */
const setAuthStore = (store: any) => {
    authStore = store;
};

/**
 * Función para mostrar opciones cuando la sesión expira
 * NO hace logout automático, solo presenta las opciones al usuario
 */
const handleUnauthorized = async () => {
    try {

        Alert.alert(
            'Sesión Expirada',
            'Tu sesión ha expirado. ¿Qué deseas hacer?',
            [
                {
                    text: 'Salir al Login',
                    style: 'cancel',
                    onPress: async () => {
                        
                        // ✅ SOLO hacer logout si el usuario lo elige explícitamente
                        if (authStore && authStore.logout) {
                            await authStore.logout();
                        } else {
                            // Fallback: Limpiar AsyncStorage manualmente
                            await AsyncStorage.multiRemove(['token', 'userInfo']);
                        }

                        try {
                            if (navigationRef) {
                                
                                // Método 1: Reset directo
                                navigationRef.reset({
                                    index: 0,
                                    routes: [{ name: 'LoginScreen' }],
                                });
                                
                            } else {
                                console.log('❌ Navigation ref not available');
                            }
                        } catch (navError) {

                            try {
                                navigationRef?.navigate?.('LoginScreen');
                            } catch (fallbackError) {
                                console.error('❌ Fallback navigation failed:', fallbackError);
                            }
                        }
                    }
                },
                {
                    text: 'Extender Sesión',
                    onPress: async () => {

                        if (authStore && authStore.extendSession) {
                            
                            try {
                                const success = await authStore.extendSession();
                                
                                if (success) {
                                    Alert.alert(
                                        'Sesión Extendida',
                                        'Tu sesión ha sido extendida exitosamente. Puedes continuar usando la aplicación.',
                                        [{ text: 'OK' }]
                                    );
                                    // ✅ NO navegar - mantener en pantalla actual
                                } else {
                                    console.log('❌ Failed to extend session');
                                    Alert.alert(
                                        'Error',
                                        'No se pudo extender la sesión. Tu token de dispositivo puede haber expirado. Por favor inicia sesión nuevamente.',
                                        [
                                            {
                                                text: 'OK',
                                                onPress: async () => {
                                                    // Si falla la extensión, hacer logout y redirigir al login
                                                    if (authStore && authStore.logout) {
                                                        await authStore.logout();
                                                    } else {
                                                        await AsyncStorage.multiRemove(['token', 'userInfo']);
                                                    }
                                                    
                                                    try {
                                                        if (navigationRef) {
                                                            navigationRef.reset({
                                                                index: 0,
                                                                routes: [{ name: 'LoginScreen' }],
                                                            });
                                                        }
                                                    } catch (navError) {
                                                        console.error('❌ Navigation error:', navError);
                                                        navigationRef?.navigate?.('LoginScreen');
                                                    }
                                                }
                                            }
                                        ]
                                    );
                                }
                            } catch (error) {
                                Alert.alert(
                                    'Error',
                                    'Ocurrió un error al extender la sesión. Por favor inicia sesión nuevamente.',
                                    [
                                        {
                                            text: 'OK',
                                            onPress: async () => {
                                                if (authStore && authStore.logout) {
                                                    await authStore.logout();
                                                } else {
                                                    await AsyncStorage.multiRemove(['token', 'userInfo']);
                                                }
                                                
                                                try {
                                                    if (navigationRef) {
                                                        navigationRef.reset({
                                                            index: 0,
                                                            routes: [{ name: 'LoginScreen' }],
                                                        });
                                                    }
                                                } catch (navError) {
                                                    console.error('❌ Navigation error:', navError);
                                                    navigationRef?.navigate?.('LoginScreen');
                                                }
                                            }
                                        }
                                    ]
                                );
                            }
                        } else {
                            Alert.alert(
                                'Error',
                                'No se puede extender la sesión en este momento. Por favor inicia sesión nuevamente.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: async () => {
                                            if (authStore && authStore.logout) {
                                                await authStore.logout();
                                            } else {
                                                await AsyncStorage.multiRemove(['token', 'userInfo']);
                                            }
                                            
                                            try {
                                                if (navigationRef) {
                                                    navigationRef.reset({
                                                        index: 0,
                                                        routes: [{ name: 'LoginScreen' }],
                                                    });
                                                }
                                            } catch (navError) {
                                                console.error('❌ Navigation error:', navError);
                                                navigationRef?.navigate?.('LoginScreen');
                                            }
                                        }
                                    }
                                ]
                            );
                        }
                    }
                }
            ],
            { cancelable: false } // ✅ Prevenir que se cierre tocando fuera
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
        return response;
    },
    async (error) => {
        // ✅ Manejar error 401 - marcar sesión expirada y mostrar opciones
        if (error.response?.status === 401) {
            
            // ✅ Marcar sesión como expirada SIN redirigir automáticamente
            if (authStore && authStore.markSessionExpired) {
                authStore.markSessionExpired();
            }
            
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
