
import { Layout, Text, Icon, Button } from "@ui-kitten/components"
import { StyleSheet } from "react-native";
import { useAuthStore } from "../../store/auth/useAuthStore";



export const HomeScreen = () => {

    const { logout } = useAuthStore();

    return (
        <Layout style={styles.container}>
            <Icon name="home-outline" fill="#3366FF" style={styles.icon} />
            <Text category="h1" style={styles.title}>¡Bienvenido!</Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>Esta es tu pantalla principal</Text>
            <Button style={styles.logoutButton} appearance="ghost" status="danger" onPress={ logout }>
                Cerrar sesión
            </Button>
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
});
