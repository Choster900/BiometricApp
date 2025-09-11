import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Text, Card, Button, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

const MenuIcon = (props: any) => (
    <Icon {...props} name='menu-outline' />
);

export const NotificationsScreen = () => {
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
                title='Notifications'
                alignment='center'
                accessoryLeft={renderMenuAction}
            />
        <View style={styles.content}>

            <Text style={{ textAlign: 'center', marginTop: 8 }}>
                Esta es la vista de notificaciones.
            </Text>
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
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E4E9F2',
    },
    notificationIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
        marginTop: 2,
    },
    notificationContent: {
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    markAllButton: {
        marginTop: 16,
    },
});
