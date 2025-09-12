import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Switch } from 'react-native';
import { Layout, Text, Card, Icon, TopNavigation, TopNavigationAction, Toggle } from '@ui-kitten/components';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

const MenuIcon = (props: any) => (
    <Icon {...props} name='menu-outline' />
);

export const SettingsScreen = () => {
    const { user, biometricEnabled, enableBiometrics, disableBiometrics, allowMultipleSessionsOptions } = useAuthStore();
    const navigation = useNavigation();


    const [localBiometricEnabled, setLocalBiometricEnabled] = useState(biometricEnabled || false);

    const [allowMultipleSessions, setAllowMultipleSessions] = useState(user?.allowMultipleSessions || false);

    console.log(user)
    const renderMenuAction = () => (
        <TopNavigationAction
            icon={MenuIcon}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
    );

    const handleBiometricToggle = async (isChecked: boolean) => {
        if (isChecked && !localBiometricEnabled) {
            await enableBiometrics();
            setLocalBiometricEnabled(true);
        } else {
            console.log(isChecked)
            await disableBiometrics();
            setLocalBiometricEnabled(isChecked);
        }
    };

    const handleMultipleSessionsToggle = (isChecked: boolean) => {
        setAllowMultipleSessions(isChecked);

        allowMultipleSessionsOptions(isChecked);

    }


    return (
        <Layout style={styles.container}>
            <TopNavigation
                title='Settings'
                alignment='center'
                accessoryLeft={renderMenuAction}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>


                {/* Security Settings */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text category='h6' style={styles.sectionTitle}>Security</Text>
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>

                            <View>
                                <Text category='s1'>Biometric Authentication</Text>
                                <Text category='c1' appearance='hint'>Use fingerprint or face ID</Text>
                            </View>
                        </View>
                        <Toggle
                            checked={localBiometricEnabled}
                            onChange={handleBiometricToggle}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>

                            <View>
                                <Text category='s1'>Allow multiple session</Text>
                                <Text category='c1' appearance='hint'>Can have sessions on different devices</Text>
                            </View>
                        </View>
                        <Toggle
                            checked={allowMultipleSessions}
                            onChange={handleMultipleSessionsToggle}
                        />
                    </View>

                </Card>


                {/* App Info */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text category='h6' style={styles.sectionTitle}>App Information</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text category='s1'>Version</Text>
                        <Text category='s1' appearance='hint'>1.0.0</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text category='s1'>Build</Text>
                        <Text category='s1' appearance='hint'>2024.001</Text>
                    </View>


                </Card>

                <View style={styles.bottomSpace} />
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
    section: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    sectionTitle: {
        flex: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E4E9F2',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    chevron: {
        width: 16,
        height: 16,
    },
    languageSelect: {
        width: 120,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    actionButton: {
        marginTop: 12,
        alignSelf: 'center',
    },
    bottomSpace: {
        height: 24,
    },
});
