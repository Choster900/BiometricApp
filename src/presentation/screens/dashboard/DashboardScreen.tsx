import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Text, Card, Button, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

const MenuIcon = (props: any) => (
    <Icon {...props} name='menu-outline' />
);

export const DashboardScreen = () => {
    const navigation = useNavigation();

    const renderMenuAction = () => (
        <TopNavigationAction
            icon={MenuIcon}
            onPress={() => {
                console.log('🍔 Dashboard: Menu button pressed!');
                navigation.dispatch(DrawerActions.openDrawer());
            }}
        />
    );

    return (
        <Layout style={styles.container}>
            <TopNavigation
                title='Dashboard'
                alignment='center'
                accessoryLeft={renderMenuAction}
            />

            <View style={styles.content}>
                <Text category='h4' style={styles.title}>Welcome to Dashboard! 👋</Text>
                <Text category='s1' style={styles.subtitle}>
                    Here's your business overview
                </Text>



                <Card style={styles.card}>
                    <Text category='h6' style={styles.cardTitle}>Recent Activity</Text>
                    <Text category='s1'>• New order received (2 min ago)</Text>
                    <Text category='s1'>• Payment processed (15 min ago)</Text>
                    <Text category='s1'>• User registered (1 hour ago)</Text>
                </Card>


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
    title: {
        marginBottom: 8,
    },
    subtitle: {
        marginBottom: 24,
        color: '#8F9BB3',
    },
    card: {
        marginBottom: 16,
    },
    cardTitle: {
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
    },
    statItem: {
        alignItems: 'center',
    },
    button: {
        marginTop: 16,
    },
});
