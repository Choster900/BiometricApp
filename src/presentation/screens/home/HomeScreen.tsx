import { Layout, Text, Icon, Button } from "@ui-kitten/components"
import { Alert, StyleSheet, TouchableWithoutFeedback } from "react-native";
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
            {/* Header Section */}
            <Layout style={styles.headerSection}>
                <Layout style={styles.avatarContainer}>
                    <Icon
                        name="person-outline"
                        style={styles.avatarIcon}
                        fill="#4caf50"
                    />
                </Layout>
                <Text category="h3" style={styles.welcomeText}>
                    Bienvenido
                </Text>
                <Text category="p1" style={styles.subtitleText}>
                    Todo está funcionando correctamente
                </Text>
            </Layout>

            {/* Quick Actions Card */}
            <Layout style={styles.actionsCard}>
                <Text category="h6" style={styles.cardTitle}>
                    Configuración rápida
                </Text>

                {/* Biometric Setting */}
                <TouchableWithoutFeedback onPress={handleBiometricsAlert}>
                    <Layout style={styles.settingRow}>
                        <Layout style={styles.settingLeft}>
                            <Layout style={[
                                styles.iconContainer,
                                { backgroundColor: hasBiometricCredentials ? '#588851ff' : '#fde3e3ff' }
                            ]}>
                                <MyIcon
                                    name={hasBiometricCredentials ? "checkmark-circle-outline" : "alert-triangle-outline"}
                                />
                            </Layout>
                            <Layout style={styles.settingTextContainer}>
                                <Text category="s1" style={styles.settingTitle}>
                                    Acceso biométrico
                                </Text>
                                <Text category="c1" style={styles.settingSubtitle}>
                                    {hasBiometricCredentials ? 'Activado' : 'Configurar autenticación'}
                                </Text>
                            </Layout>
                        </Layout>
                        { <MyIcon
                            name="settings-outline"

                        />}
                    </Layout>
                </TouchableWithoutFeedback>
            </Layout>

            {/* Logout Section */}
            <Layout style={styles.logoutSection}>
                <TouchableWithoutFeedback onPress={logout}>
                    <Layout style={styles.logoutButton}>

                        <Text category="s1" style={styles.logoutText}>
                            Cerrar sesión
                        </Text>
                        <MyIcon
                            name="corner-down-left-outline"
                        />
                    </Layout>
                </TouchableWithoutFeedback>
            </Layout>
        </Layout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: 'transparent',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e8f5e8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarIcon: {
        width: 32,
        height: 32,
    },
    welcomeText: {
        marginBottom: 8,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    subtitleText: {
        color: '#666',
        textAlign: 'center',
    },
    actionsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardTitle: {
        marginBottom: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        backgroundColor: 'transparent',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingIcon: {
        width: 20,
        height: 20,
    },
    settingTextContainer: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    settingTitle: {
        fontWeight: '500',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    settingSubtitle: {
        color: '#666',
        fontSize: 12,
    },
    chevronIcon: {
        width: 16,
        height: 16,
    },
    logoutSection: {
        marginTop: 'auto',
        marginBottom: 40,
        backgroundColor: 'transparent',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#ffebee',
    },
    logoutIcon: {
        width: 18,
        height: 18,
        marginRight: 8,
    },
    logoutText: {
        color: '#f44336',
        fontWeight: '500',
    },
});
