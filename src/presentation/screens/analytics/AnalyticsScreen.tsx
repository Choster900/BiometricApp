import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Text, Card, Button, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

const MenuIcon = (props: any) => (
    <Icon {...props} name='menu-outline' />
);

export const AnalyticsScreen = () => {
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
                title='Analytics'
                alignment='center'
                accessoryLeft={renderMenuAction}
            />

            <View style={styles.content}>
                <Card style={styles.card}>
                    <Text category='h6' style={styles.cardTitle}>Overview</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text category='h6'>142</Text>
                            <Text category='c1' appearance='hint'>Total Views</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text category='h6'>28</Text>
                            <Text category='c1' appearance='hint'>Active Users</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text category='h6'>3.2%</Text>
                            <Text category='c1' appearance='hint'>Conversion</Text>
                        </View>
                    </View>
                </Card>


                <Card style={styles.card}>
                    <Text category='h6' style={styles.cardTitle}>Recent Activity</Text>
                    <Text category='s1'>Page visits today: 45</Text>
                    <Text category='s1'>New users: 12</Text>
                    <Text category='s1'>Bounce rate: 32%</Text>
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
    card: {
        marginBottom: 16,
    },
    cardTitle: {
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    chartPlaceholder: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
        borderRadius: 8,
        marginVertical: 8,
    },
    chartIcon: {
        width: 32,
        height: 32,
        marginBottom: 8,
    },
    refreshButton: {
        marginTop: 16,
    },
});
