
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/StackNavigator';
import { PropsWithChildren, useEffect } from 'react';
import { useAuthStore } from '../store/auth/useAuthStore';
import { setAuthStore } from '../../config/ditoApi';

export const AuthProvider = ({ children }: PropsWithChildren) => {

    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const authStore = useAuthStore();
    const { checkStatus, status } = authStore;

    // ✅ Configurar la referencia del store para ditoApi
    useEffect(() => {
        console.log('🔧 Configuring auth store for ditoApi...');
        setAuthStore(authStore);
    }, [authStore]);

    // ✅ Check status inicial
    useEffect(() => {
        console.log('🔄 Initial auth status check...');
        checkStatus();
    }, []);

    useEffect(() => {

        if ( status !== 'checking' && status !== 'expired' ) {

            if ( status === 'authenticated' ) {

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'DrawerNavigator' }],
                });

            }else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'LoginScreen' }],
                });
            }

        }
    }, [status]);

    return (
        <>
            {children}
        </>
    )
}
