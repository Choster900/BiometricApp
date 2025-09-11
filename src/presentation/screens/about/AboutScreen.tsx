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
                        <View style={styles.appIcon}>
                            <Icon name='smartphone-outline' fill='#3366FF' style={styles.largeIcon} />
                        </View>
                        <View style={styles.appDetails}>
                            <Text category='h5'>BiometricApp</Text>
                            <Text category='s1' appearance='hint'>Version 1.0.0</Text>
                            <Text category='c1' appearance='hint'>Secure mobile app</Text>
                        </View>
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text category='h6' style={styles.cardTitle}>Features</Text>
                    <Text category='s1'>• Biometric Authentication</Text>
                    <Text category='s1'>• Secure Data Storage</Text>
                    <Text category='s1'>• Real-time Analytics</Text>
                    <Text category='s1'>• Cross-platform Support</Text>
                </Card>

                <Card style={styles.card}>
                    <Text category='h6' style={styles.cardTitle}>Built With</Text>
                    <Text category='s1'>React Native & TypeScript</Text>
                    <Text category='s1'>UI Kitten Design System</Text>
                    <Text category='s1'>Zustand State Management</Text>
                </Card>

                <Card style={styles.card}>
                    <Text category='h6' style={styles.cardTitle}>Support</Text>
                    <Button
                        style={styles.supportButton}
                        appearance='outline'
                        size='small'
                        accessoryLeft={(props) => <Icon {...props} name='question-mark-circle-outline' />}
                    >
                        Help & Support
                    </Button>
                </Card>

                <View style={styles.copyright}>
                    <Icon name='heart-outline' fill='#FF3D71' style={styles.heartIcon} />
                    <Text category='c1' appearance='hint'>Made with love</Text>
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
    cardTitle: {
        marginBottom: 12,
    },
    appHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#F7F9FC',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    largeIcon: {
        width: 28,
        height: 28,
    },
    appDetails: {
        flex: 1,
    },
    supportButton: {
        alignSelf: 'flex-start',
    },
    copyright: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    heartIcon: {
        width: 16,
        height: 16,
        marginRight: 6,
    },
});
