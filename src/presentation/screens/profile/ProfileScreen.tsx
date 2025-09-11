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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Card style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <Avatar
                            size='giant'
                            source={{ uri: 'https://via.placeholder.com/150/3366FF/FFFFFF?text=U' }}
                            style={styles.avatar}
                        />
                        <View style={styles.profileInfo}>
                            <Text category='h5' style={styles.userName}>
                                {user?.fullName || 'Usuario Demo'}
                            </Text>
                            <Text category='s1' appearance='hint' style={styles.userEmail}>
                                {user?.email || 'demo@example.com'}
                            </Text>
                            <Text category='c1' appearance='hint' style={styles.userRole}>
                                Senior Developer
                            </Text>
                        </View>
                    </View>

                    <Button
                        style={styles.editButton}
                        appearance='outline'
                        size='small'
                        accessoryLeft={(props) => <Icon {...props} name='edit-outline' />}
                    >
                        Edit Profile
                    </Button>
                </Card>


                <Button
                    style={styles.logoutButton}
                    status='danger'
                    onPress={logout}
                    accessoryLeft={(props) => <Icon {...props} name='log-out-outline' />}
                >
                    Logout
                </Button>
            </ScrollView>
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
    profileCard: {
        marginBottom: 16,
        paddingBottom: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
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
        marginBottom: 2,
    },
    userRole: {
        fontStyle: 'italic',
    },
    editButton: {
        alignSelf: 'center',
    },
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
    logoutButton: {
        marginBottom: 24,
    },
});
