import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Text, Card, Button, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

const MenuIcon = (props: any) => (
    <Icon {...props} name='menu-outline' />
);

export const AboutScreen = () => {
    const navigation = useNavigation();

    const renderMenuAction = () => (
        <TopNavigationAction
            icon={MenuIcon}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
    );

    return (
        <Layout style={styles.container}>
            <TopNavigation
                title='About'
                alignment='center'
                accessoryLeft={renderMenuAction}
            />

            <View style={styles.content}>
                <Card style={styles.card}>
                    <View style={styles.appHeader}>
                        <View style={styles.appInfo}>
                            <Text category='h5'>BiometricApp</Text>
                            <Text category='s1' appearance='hint'>Version 1.0.0</Text>
                        </View>
                    </View>

                    <Text category='p1' style={styles.description}>
                        A secure mobile application with biometric authentication and modern UI.
                    </Text>
                </Card>

                <Card style={styles.card}>
                    <Text category='h6' style={styles.cardTitle}>Technologies</Text>
                    <Text category='s1'>• React Native</Text>
                    <Text category='s1'>• UI Kitten</Text>
                    <Text category='s1'>• TypeScript</Text>
                    <Text category='s1'>• Biometric Authentication</Text>
                </Card>

                <Card style={styles.card}>
                    <Text category='h6' style={styles.cardTitle}>Contact & Support</Text>
                    <Button
                        style={styles.linkButton}
                        appearance='ghost'
                        status='basic'

                    >
                        Contact Support
                    </Button>
                    <Button
                        style={styles.linkButton}
                        appearance='ghost'
                        status='basic'

                    >
                        Visit Website
                    </Button>
                </Card>

                <View style={styles.footer}>
                    <Text category='c1' appearance='hint'>© 2024 BiometricApp</Text>
                    <Text category='c1' appearance='hint'>All rights reserved</Text>
                </View>
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        marginBottom: 16,
    },
    appHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    appIcon: {
        width: 32,
        height: 32,
        marginRight: 12,
    },
    appInfo: {
        flex: 1,
    },
    description: {
        marginTop: 8,
    },
    cardTitle: {
        marginBottom: 12,
    },
    linkButton: {
        justifyContent: 'flex-start',
        marginBottom: 4,
    },
    footer: {
        alignItems: 'center',
        marginTop: 24,
    },
});
