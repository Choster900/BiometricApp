
import { Layout, Text, Spinner } from "@ui-kitten/components"
import { StyleSheet } from "react-native";



export const LoadingScreen = () => {
    return (
        <Layout style={styles.container}>
            <Spinner size="giant" status="primary" />
            <Text category="h5" style={styles.text}>Cargando...</Text>
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
    text: {
        marginTop: 24,
        color: '#222',
    },
});
