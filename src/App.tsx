
import 'react-native-gesture-handler';

import { ApplicationProvider, IconRegistry, Layout, Text } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import { NavigationContainer } from '@react-navigation/native';
import { StackNavigator } from './presentation/navigation/StackNavigator';
import { useColorScheme } from 'react-native';
import { AuthProvider } from './presentation/providers/AuthProvider';
import { setNavigationRef } from './config/ditoApi';
import { useRef } from 'react';
import { useAuthStore } from './presentation/store/auth/useAuthStore';

export const App = () => {

    const colorScheme = useColorScheme();
    
    // ✅ Crear referencia para la navegación
    const navigationRef = useRef<any>(null);
    
    // Referencias para controlar el debounce del check status
    const lastCheckTime = useRef<number>(0);
    const checkDebounceTimeout = useRef<number | null>(null);
    const DEBOUNCE_DELAY = 2000; // 2 segundos de delay entre checks

    const theme = colorScheme === 'dark' ? eva.dark : eva.light;

    const backgroundColor = colorScheme === 'dark' ? theme['color-basic-800'] : theme['color-basic-100'];

    // ✅ Función para manejar cambios de navegación
    const handleNavigationStateChange = () => {
        const currentTime = Date.now();
        const timeSinceLastCheck = currentTime - lastCheckTime.current;

        // Solo hacer check si ha pasado suficiente tiempo (debounce)
        if (timeSinceLastCheck > DEBOUNCE_DELAY) {
            
            // Limpiar timeout anterior si existe
            if (checkDebounceTimeout.current) {
                clearTimeout(checkDebounceTimeout.current);
            }

            // Ejecutar check después de un pequeño delay para evitar múltiples calls
            checkDebounceTimeout.current = setTimeout(() => {
                // Obtener el store y hacer check
                const authStore = useAuthStore.getState();
                if (authStore.checkStatus) {
                    authStore.checkStatus();
                    lastCheckTime.current = Date.now();
                }
                checkDebounceTimeout.current = null;
            }, 100);
        }
    };

    return (
        <>
            <IconRegistry icons={EvaIconsPack} />

            <ApplicationProvider  {...eva} theme={theme}>
                <NavigationContainer
                    ref={navigationRef}
                    onStateChange={handleNavigationStateChange}
                    onReady={() => {
                        setNavigationRef(navigationRef.current)
                        lastCheckTime.current = Date.now();
                    }}
                    theme={{
                        dark: colorScheme === 'dark',
                        colors: {
                            primary: theme['color-primary-500'],
                            background: backgroundColor,
                            card: theme['color-basic-100'],
                            text: theme['color-basic-color'],
                            border: theme['color-basic-600'],
                            notification: theme['color-primary-500'],
                        },
                        fonts: {
                            regular: { fontFamily: 'System', fontWeight: 'normal' as 'normal' },
                            medium: { fontFamily: 'System', fontWeight: '500' as '500' },
                            bold: { fontFamily: 'System', fontWeight: 'bold' as 'bold' },
                            heavy: { fontFamily: 'System', fontWeight: '900' as '900' },
                        }
                    }}>
                    <AuthProvider>
                        <StackNavigator />
                    </AuthProvider>

                </NavigationContainer>
            </ApplicationProvider>
        </>

    )
}
