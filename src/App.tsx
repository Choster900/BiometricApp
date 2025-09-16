
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

export const App = () => {

    const colorScheme = useColorScheme();
    
    // ✅ Crear referencia para la navegación
    const navigationRef = useRef<any>(null);

    const theme = colorScheme === 'dark' ? eva.dark : eva.light;

    const backgroundColor = colorScheme === 'dark' ? theme['color-basic-800'] : theme['color-basic-100'];

    return (
        <>
            <IconRegistry icons={EvaIconsPack} />

            <ApplicationProvider  {...eva} theme={theme}>
                <NavigationContainer
                    ref={navigationRef}
                    onReady={() => {
                        // ✅ Configurar la referencia para ditoApi cuando la navegación esté lista
                        console.log('🚀 Navigation ready, setting ref...');
                        console.log('🔍 Navigation ref current:', !!navigationRef.current);
                        setNavigationRef(navigationRef.current);
                        console.log('✅ Navigation ref configured for ditoApi');
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
