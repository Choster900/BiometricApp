
import { Layout, Text, Icon, Button } from "@ui-kitten/components"
import { Alert, StyleSheet } from "react-native";
import { useAuthStore } from "../../store/auth/useAuthStore";
import { MyIcon } from "../../components/ui/MyIcon";
import { authEnableBiometrics } from "../../../actions/auth/auth";
import { useState, useEffect } from "react";
import * as Keychain from 'react-native-keychain';



export const HomeScreen = () => {

    const { enableBiometrics, logout } = useAuthStore();
    const [hasBiometricCredentials, setHasBiometricCredentials] = useState(false);

    // Verificar si existen credenciales biométricas al cargar
    useEffect(() => {
        const checkBiometricCredentials = async () => {
            try {
                const hasCredentials = await Keychain.hasGenericPassword();
                setHasBiometricCredentials(hasCredentials);
            } catch (error) {
                console.error('Error checking biometric credentials:', error);
                setHasBiometricCredentials(false);
            }
        };

        checkBiometricCredentials();
    }, []);

    const authEnableBiometricsPress = async () => {
        try {
            await enableBiometrics();
            // Actualizar el estado después de habilitar
            setHasBiometricCredentials(true);
        } catch (error) {
            console.error('Error enabling biometrics:', error);
        }
    }

    const authDisableBiometricsPress = async () => {
        try {
            // Borrar las credenciales del Keychain
            await Keychain.resetGenericPassword();
            setHasBiometricCredentials(false);
            Alert.alert('Biometría deshabilitada', 'Se han eliminado las credenciales biométricas');
        } catch (error) {
            console.error('Error disabling biometrics:', error);
            Alert.alert('Error', 'No se pudo deshabilitar la biometría');
        }
    }

    const handleBiometricsAlert = () => {
        if (hasBiometricCredentials) {
            // Si ya está habilitada, preguntar si quiere deshabilitar
            Alert.alert(
                'Deshabilitar Biometría',
                '¿Deseas deshabilitar el acceso biométrico?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Deshabilitar',
                        style: 'destructive',
                        onPress: authDisableBiometricsPress
                    }
                ]
            );
        } else {
            // Si no está habilitada, preguntar si quiere habilitar
            Alert.alert(
                'Habilitar Biometría',
                '¿Deseas habilitar el acceso biométrico para futuros ingresos?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Habilitar',
                        onPress: authEnableBiometricsPress
                    }
                ]
            );
        }
    }
    return (
        <Layout style={styles.container}>
            <Icon name="home-outline" fill="#3366FF" style={styles.icon} />
            <Text category="h1" style={styles.title}>¡Bienvenido!</Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>Esta es tu pantalla principal</Text>
            <Button style={styles.logoutButton} appearance="ghost" status="danger" onPress={logout}>
                Cerrar sesión
            </Button>

            {/* Space */}
            <Layout style={{ height: 20 }} />
            {/* Botón dinámico para biometría */}
            <Layout style={styles.biometricContainer}>
                <Button
                    appearance="ghost"
                    status={hasBiometricCredentials ? "warning" : "info"}
                    size="small"
                    accessoryLeft={<MyIcon name={hasBiometricCredentials ? "shield-off-outline" : "settings-outline"} />}
                    onPress={handleBiometricsAlert}
                    disabled={false}
                >
                    {hasBiometricCredentials ? 'Deshabilitar biometría' : 'Configurar biometría'}
                </Button>
            </Layout>
        </Layout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    icon: {
        width: 64,
        height: 64,
        marginBottom: 24,
    },
    title: {
        marginBottom: 8,
    },
    subtitle: {
        color: '#888',
        marginBottom: 32,
    },
    logoutButton: {
        marginTop: 16,
        width: 180,
    },
    biometricContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
});
