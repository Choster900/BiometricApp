import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Text, Card, Button, Icon, TopNavigation, TopNavigationAction, Avatar } from '@ui-kitten/components';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

const MenuIcon = (props: any) => (
    <Icon {...props} name='menu-outline' />
);

export const ProfileScreen = () => {
    const { user, logout } = useAuthStore();
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
                title='Profile'
                alignment='center'
                accessoryLeft={renderMenuAction}
            />

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Card style={styles.profileCard}>
                    {/* Header centrado */}
                    <View style={styles.profileHeader}>
                        <Avatar
                            size='giant'
                            ImageComponent={() => (
                                <Icon
                                    name='person-outline'
                                    style={{ width: 80, height: 80 }}
                                    fill='#3366FF'
                                />
                            )}
                            style={styles.avatar}
                        />
                    </View>
                    
                    {/* Información centrada */}
                    <View style={styles.profileInfo}>
                        <Text category='h4' style={styles.userName}>
                            {user?.fullName || 'Usuario Demo'}
                        </Text>
                        <Text category='s1' appearance='hint' style={styles.userEmail}>
                            {user?.email || 'demo@example.com'}
                        </Text>
                        <Text category='c1' appearance='hint' style={styles.userRole}>
                            Senior Developer
                        </Text>
                    </View>

                    {/* Botón centrado con mejor espaciado */}
                    <View style={styles.buttonContainer}>
                        <Button
                            style={styles.editButton}
                            appearance='outline'
                            size='medium'
                            accessoryLeft={(props) => <Icon {...props} name='edit-outline' />}
                        >
                            Edit Profile
                        </Button>
                    </View>
                </Card>

                {/* Botón de logout centrado */}
                <View style={styles.logoutContainer}>
                    <Button
                        style={styles.logoutButton}
                        status='danger'
                        size='medium'
                        onPress={logout}
                        accessoryLeft={(props) => <Icon {...props} name='log-out-outline' />}
                    >
                        Logout
                    </Button>
                </View>
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    profileCard: {
        marginBottom: 24,
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        borderWidth: 3,
        borderColor: '#E4E9F2',
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    userName: {
        marginBottom: 8,
        fontWeight: '600',
        textAlign: 'center',
    },
    userEmail: {
        marginBottom: 6,
        textAlign: 'center',
    },
    userRole: {
        fontStyle: 'italic',
        textAlign: 'center',
    },
    buttonContainer: {
        alignItems: 'center',
    },
    editButton: {
        minWidth: 140,
        borderRadius: 20,
    },
    logoutContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    logoutButton: {
        minWidth: 140,
        borderRadius: 20,
    },
    // Estilos no utilizados pero mantenidos por compatibilidad
    statsCard: {
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statItemIcon: {
        width: 32,
        height: 32,
        marginBottom: 8,
    },
    statValue: {
        marginBottom: 4,
    },
    achievementsCard: {
        marginBottom: 16,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E4E9F2',
    },
    achievementIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        marginBottom: 2,
        fontWeight: '600',
    },
    optionsCard: {
        marginBottom: 24,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E4E9F2',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    optionTitle: {
        fontWeight: '500',
    },
    chevron: {
        width: 16,
        height: 16,
    },
    sectionTitle: {
        marginBottom: 12,
    },
});