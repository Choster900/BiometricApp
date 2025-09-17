import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Switch } from 'react-native';
import { Layout, Text, Card, Icon, TopNavigation, TopNavigationAction, Toggle } from '@ui-kitten/components';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

const MenuIcon = (props: any) => (
    <Icon {...props} name='menu-outline' />
);

const SecurityIcon = (props: any) => (
    <Icon {...props} name='shield-outline' />
);

const InfoIcon = (props: any) => (
    <Icon {...props} name='info-outline' />
);

const BiometricIcon = (props: any) => (
    <Icon {...props} name='person-outline' />
);

export const SettingsScreen = () => {
    const { user, biometricEnabled, enableBiometrics, disableBiometrics } = useAuthStore();
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
            const result = await enableBiometrics();
            if (result) {
                setLocalBiometricEnabled(true);
            }
        } else if (!isChecked && localBiometricEnabled) {
            const result = await disableBiometrics();
            if (result) {
                setLocalBiometricEnabled(false);
            }
        }
    };

    return (
        <Layout style={styles.container}>
            <TopNavigation
                title='Settings'
                alignment='center'
                accessoryLeft={renderMenuAction}
            />

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Security Settings */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <SecurityIcon style={styles.sectionIcon} />
                        <Text category='h6' style={styles.sectionTitle}>Security</Text>
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <BiometricIcon style={styles.itemIcon} />
                            <View style={styles.settingInfo}>
                                <Text category='s1' style={styles.settingLabel}>Biometric Authentication</Text>
                                <Text category='c1' appearance='hint' style={styles.settingDescription}>
                                    Use fingerprint or face ID for secure access
                                </Text>
                            </View>
                        </View>
                        <Toggle
                            checked={localBiometricEnabled}
                            onChange={handleBiometricToggle}
                        />
                    </View>
                </Card>

                {/* App Info */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <InfoIcon style={styles.sectionIcon} />
                        <Text category='h6' style={styles.sectionTitle}>App Information</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Text category='s1' style={styles.infoLabel}>Version</Text>
                            <Text category='s1' appearance='hint' style={styles.infoValue}>1.0.0</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text category='s1' style={styles.infoLabel}>Build</Text>
                            <Text category='s1' appearance='hint' style={styles.infoValue}>2024.001</Text>
                        </View>
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
    scrollView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: 20,
    },
    section: {
        marginBottom: 20,
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E4E9F2',
    },
    sectionIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
        tintColor: '#3366FF',
    },
    sectionTitle: {
        flex: 1,
        fontWeight: '600',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 16,
    },
    itemIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        tintColor: '#8F9BB3',
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        marginBottom: 4,
        fontWeight: '500',
    },
    settingDescription: {
        fontSize: 12,
        lineHeight: 16,
    },
    infoContainer: {
        paddingTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F7F9FC',
    },
    infoLabel: {
        fontWeight: '500',
    },
    infoValue: {
        fontWeight: '400',
    },
    chevron: {
        width: 16,
        height: 16,
    },
    languageSelect: {
        width: 120,
    },
    actionButton: {
        marginTop: 12,
        alignSelf: 'center',
    },
    bottomSpace: {
        height: 32,
    },
});