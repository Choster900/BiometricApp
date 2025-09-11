import React from 'react';
import { ScrollView, StyleSheet, View, Linking } from 'react-native';
import { Layout, Text, Card, Button, Icon, TopNavigation, TopNavigationAction, Divider } from '@ui-kitten/components';
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
            onPress={() => {
                console.log('ℹ️ About: Menu button pressed!');
                console.log('ℹ️ Navigation object:', navigation);
                console.log('ℹ️ Available methods:', Object.keys(navigation));
                try {
                    navigation.dispatch(DrawerActions.openDrawer());
                    console.log('ℹ️ Drawer action dispatched successfully');
                } catch (error) {
                    console.error('ℹ️ Error dispatching drawer action:', error);
                }
            }}
        />
    );

    const appFeatures = [
        { title: 'Biometric Authentication', icon: 'fingerprint-outline', color: '#3366FF' },
        { title: 'Secure Data Storage', icon: 'shield-outline', color: '#00E096' },
        { title: 'Real-time Analytics', icon: 'activity-outline', color: '#FFAA00' },
        { title: 'Cross-platform Support', icon: 'smartphone-outline', color: '#FF3D71' },
        { title: 'Dark Mode Support', icon: 'moon-outline', color: '#8F9BB3' },
        { title: 'Push Notifications', icon: 'bell-outline', color: '#3366FF' },
    ];

    const teamMembers = [
        { name: 'Sarah Johnson', role: 'Lead Developer', avatar: '👩‍💻' },
        { name: 'Mike Chen', role: 'UI/UX Designer', avatar: '👨‍🎨' },
        { name: 'Alex Rodriguez', role: 'Backend Engineer', avatar: '👨‍💻' },
        { name: 'Emily Davis', role: 'QA Engineer', avatar: '👩‍🔬' },
    ];

    const handleLinkPress = (url: string) => {
        Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
    };

    return (
        <Layout style={styles.container}>
            <TopNavigation
                title='About'
                alignment='center'
                accessoryLeft={renderMenuAction}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* App Info */}
                <Card style={styles.appInfoCard}>
                    <View style={styles.appHeader}>
                        <View style={styles.appIcon}>
                            <Icon name='smartphone-outline' fill='#3366FF' style={styles.largeIcon} />
                        </View>
                        <View style={styles.appDetails}>
                            <Text category='h4' style={styles.appName}>BiometricApp</Text>
                            <Text category='s1' appearance='hint'>Version 1.0.0</Text>
                            <Text category='c1' appearance='hint'>Build 2024.001</Text>
                        </View>
                    </View>

                    <Text category='p1' style={styles.appDescription}>
                        A modern, secure mobile application featuring biometric authentication,
                        real-time analytics, and a beautiful user interface built with React Native
                        and UI Kitten.
                    </Text>
                </Card>

                {/* Features */}
                <Card style={styles.featuresCard}>
                    <Text category='h6' style={styles.sectionTitle}>Key Features</Text>
                    <View style={styles.featuresGrid}>
                        {appFeatures.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <Icon
                                    name={feature.icon}
                                    fill={feature.color}
                                    style={styles.featureIcon}
                                />
                                <Text category='s2' style={styles.featureText}>
                                    {feature.title}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Card>

                {/* Technology Stack */}
                <Card style={styles.techCard}>
                    <Text category='h6' style={styles.sectionTitle}>Built With</Text>

                    <View style={styles.techItem}>
                        <Text category='s1' style={styles.techName}>React Native</Text>
                        <Text category='c1' appearance='hint'>Cross-platform mobile framework</Text>
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.techItem}>
                        <Text category='s1' style={styles.techName}>UI Kitten</Text>
                        <Text category='c1' appearance='hint'>React Native UI library based on Eva Design</Text>
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.techItem}>
                        <Text category='s1' style={styles.techName}>TypeScript</Text>
                        <Text category='c1' appearance='hint'>Type-safe JavaScript development</Text>
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.techItem}>
                        <Text category='s1' style={styles.techName}>Zustand</Text>
                        <Text category='c1' appearance='hint'>Modern state management solution</Text>
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.techItem}>
                        <Text category='s1' style={styles.techName}>React Native Keychain</Text>
                        <Text category='c1' appearance='hint'>Secure biometric authentication</Text>
                    </View>
                </Card>

                {/* Development Team */}
                <Card style={styles.teamCard}>
                    <Text category='h6' style={styles.sectionTitle}>Development Team</Text>
                    {teamMembers.map((member, index) => (
                        <View key={index} style={styles.teamMember}>
                            <Text style={styles.memberAvatar}>{member.avatar}</Text>
                            <View style={styles.memberInfo}>
                                <Text category='s1' style={styles.memberName}>{member.name}</Text>
                                <Text category='c1' appearance='hint'>{member.role}</Text>
                            </View>
                        </View>
                    ))}
                </Card>

                {/* Legal & Links */}
                <Card style={styles.linksCard}>
                    <Text category='h6' style={styles.sectionTitle}>Legal & Support</Text>

                    <Button
                        style={styles.linkButton}
                        appearance='ghost'
                        status='basic'
                        accessoryLeft={(props) => <Icon {...props} name='file-text-outline' />}
                        onPress={() => handleLinkPress('https://example.com/privacy')}
                    >
                        Privacy Policy
                    </Button>

                    <Button
                        style={styles.linkButton}
                        appearance='ghost'
                        status='basic'
                        accessoryLeft={(props) => <Icon {...props} name='book-outline' />}
                        onPress={() => handleLinkPress('https://example.com/terms')}
                    >
                        Terms of Service
                    </Button>

                    <Button
                        style={styles.linkButton}
                        appearance='ghost'
                        status='basic'
                        accessoryLeft={(props) => <Icon {...props} name='question-mark-circle-outline' />}
                        onPress={() => handleLinkPress('https://example.com/support')}
                    >
                        Help & Support
                    </Button>

                    <Button
                        style={styles.linkButton}
                        appearance='ghost'
                        status='basic'
                        accessoryLeft={(props) => <Icon {...props} name='github-outline' />}
                        onPress={() => handleLinkPress('https://github.com/example/biometric-app')}
                    >
                        Source Code
                    </Button>
                </Card>

                {/* Copyright */}
                <Card style={styles.copyrightCard}>
                    <View style={styles.copyrightContent}>
                        <Icon name='heart-outline' fill='#FF3D71' style={styles.heartIcon} />
                        <Text category='c1' appearance='hint' style={styles.copyrightText}>
                            Made with love by the BiometricApp team
                        </Text>
                    </View>
                    <Text category='c2' appearance='hint' style={styles.copyrightYear}>
                        © 2024 BiometricApp. All rights reserved.
                    </Text>
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
    appInfoCard: {
        marginBottom: 16,
    },
    appHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    appIcon: {
        width: 60,
        height: 60,
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    largeIcon: {
        width: 32,
        height: 32,
    },
    appDetails: {
        flex: 1,
    },
    appName: {
        marginBottom: 4,
    },
    appDescription: {
        lineHeight: 22,
    },
    featuresCard: {
        marginBottom: 16,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    featureText: {
        flex: 1,
        fontSize: 13,
    },
    techCard: {
        marginBottom: 16,
    },
    techItem: {
        paddingVertical: 8,
    },
    techName: {
        fontWeight: '600',
        marginBottom: 2,
    },
    divider: {
        marginVertical: 4,
    },
    teamCard: {
        marginBottom: 16,
    },
    teamMember: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E4E9F2',
    },
    memberAvatar: {
        fontSize: 24,
        marginRight: 12,
        width: 40,
        textAlign: 'center',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontWeight: '500',
        marginBottom: 2,
    },
    linksCard: {
        marginBottom: 16,
    },
    linkButton: {
        justifyContent: 'flex-start',
        marginBottom: 4,
    },
    copyrightCard: {
        marginBottom: 16,
        alignItems: 'center',
    },
    copyrightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    heartIcon: {
        width: 16,
        height: 16,
        marginRight: 6,
    },
    copyrightText: {
        textAlign: 'center',
    },
    copyrightYear: {
        textAlign: 'center',
    },
    sectionTitle: {
        marginBottom: 12,
    },
    bottomSpace: {
        height: 24,
    },
});
