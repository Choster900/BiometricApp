import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Layout, Text, Icon, Button, Avatar, Divider } from '@ui-kitten/components';
import { BottomTabsNavigator } from './BottomTabsNavigator';
import { AboutScreen } from '../screens/about/AboutScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { useAuthStore } from '../store/auth/useAuthStore';

export type DrawerParamList = {
    MainTabs: undefined;
    About: undefined;
    Home: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

interface CustomDrawerContentProps extends DrawerContentComponentProps {}

const CustomDrawerContent = (props: CustomDrawerContentProps) => {
   /*  console.log('🗂️ DrawerContent rendered!');
    console.log('🗂️ DrawerContent props:', Object.keys(props)); */
    const { user, logout } = useAuthStore();
    const { navigation } = props;

    const drawerItems = [
        {
            label: 'Dashboard',
            icon: 'home-outline',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Dashboard' }),
        },
    ];

    const secondaryItems = [
        {
            label: 'Home (Legacy)',
            icon: 'grid-outline',
            onPress: () => navigation.navigate('Home'),
        },
        {
            label: 'About',
            icon: 'info-outline',
            onPress: () => navigation.navigate('About'),
        },
    ];

    const renderDrawerItem = (item: any, index: number) => (
        <View key={index} style={styles.drawerItem}>
            <Button
                style={styles.drawerButton}
                appearance='ghost'
                status='basic'
                onPress={item.onPress}
                accessoryLeft={(props) => (
                    <Icon {...props} name={item.icon} fill='#8F9BB3' />
                )}
            >
                {item.label}
            </Button>
            {item.badge && (
                <View style={styles.badge}>
                    <Text category='c2' style={styles.badgeText}>{item.badge}</Text>
                </View>
            )}
        </View>
    );

    return (
        <Layout style={styles.drawerContainer}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                {/* User Profile Section */}
                <View style={styles.profileSection}>
                    <Avatar
                        size='large'
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png' }}
                        style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                        <Text category='h6' style={styles.userName}>
                            {user?.fullName || 'Usuario Demo'}
                        </Text>
                        <Text category='s2' appearance='hint' style={styles.userEmail}>
                            {user?.email || 'demo@example.com'}
                        </Text>
                        <View style={styles.userBadge}>
                            <Icon name='checkmark-circle-outline' fill='#00E096' style={styles.badgeIcon} />
                            <Text category='c1' style={styles.verifiedText}>Verified</Text>
                        </View>
                    </View>
                </View>

                <Divider style={styles.divider} />

                {/* Main Navigation Items */}
                <View style={styles.navigationSection}>
                    <Text category='s1' appearance='hint' style={styles.sectionTitle}>
                        Opciones principales
                    </Text>
                    {drawerItems.map((item, index) => renderDrawerItem(item, index))}
                </View>

                <Divider style={styles.divider} />

                {/* Secondary Navigation Items */}
                <View style={styles.navigationSection}>
                    <Text category='s1' appearance='hint' style={styles.sectionTitle}>
                        Otras opciones
                    </Text>
                    {secondaryItems.map((item, index) => renderDrawerItem(item, index))}
                </View>

                <View style={styles.spacer} />

                {/* App Info */}
                <View style={styles.appInfoSection}>
                    <View style={styles.appInfo}>
                        <Icon name='smartphone-outline' fill='#3366FF' style={styles.appIcon} />
                        <View>
                            <Text category='s2' style={styles.appName}>BiometricApp</Text>
                            <Text category='c1' appearance='hint'>Version 1.0.0</Text>
                        </View>
                    </View>
                </View>

                <Divider style={styles.divider} />

                {/* Logout Button */}
                <Button
                    style={styles.logoutButton}
                    status='danger'
                    appearance='ghost'
                    onPress={logout}
                    accessoryLeft={(props) => <Icon {...props} name='log-out-outline' />}
                >
                    Logout
                </Button>
            </DrawerContentScrollView>
        </Layout>
    );
};

export const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => {
                return <CustomDrawerContent {...props} />;
            }}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#FFFFFF',
                    width: 300,
                },
                drawerType: 'slide',
                overlayColor: 'rgba(0,0,0,0.5)',
                // Permite abrir el drawer deslizando desde prácticamente cualquier parte de la pantalla.
                // Ajusta el valor si interfiere con otros gestos (por ejemplo: Dimensions.get('window').width * 0.8)
                swipeEdgeWidth: Dimensions.get('window').width, // área activa para gesto horizontal
                swipeEnabled: true,
            }}
        >
            <Drawer.Screen
                name="MainTabs"
                component={BottomTabsNavigator}
                options={{
                    drawerLabel: 'Dashboard',
                }}
            />
            <Drawer.Screen
                name="About"
                component={AboutScreen}
                options={{
                    drawerLabel: 'About',
                }}
            />
            <Drawer.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    drawerLabel: 'Home (Legacy)',
                }}
            />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
    },
    drawerContent: {
        flexGrow: 1,
        paddingTop: 0,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
        backgroundColor: '#F7F9FC',
    },
    avatar: {
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        marginBottom: 4,
    },
    userEmail: {
        marginBottom: 8,
    },
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeIcon: {
        width: 14,
        height: 14,
        marginRight: 4,
    },
    verifiedText: {
        color: '#00E096',
        fontWeight: '500',
    },
    navigationSection: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sectionTitle: {
        marginBottom: 8,
        paddingHorizontal: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    drawerButton: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    badge: {
        backgroundColor: '#FF3D71',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 16,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 10,
    },
    divider: {
        marginVertical: 8,
    },
    spacer: {
        flex: 1,
    },
    appInfoSection: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    appInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    appName: {
        fontWeight: '600',
        marginBottom: 2,
    },
    logoutButton: {
        marginHorizontal: 16,
        marginBottom: 20,
        justifyContent: 'flex-start',
    },
});
