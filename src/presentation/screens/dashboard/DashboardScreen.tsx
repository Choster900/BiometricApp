import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
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
                style={styles.topNav}
            />

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Header mejorado */}
                    <View style={styles.headerSection}>
                        <Text category='h2' style={styles.welcomeTitle}>¡Hola! 👋</Text>
                        <Text category='s1' style={styles.welcomeSubtitle}>
                            Aquí tienes un resumen de tu negocio
                        </Text>
                        <View style={styles.dateContainer}>
                            <Icon name='calendar-outline' width={16} height={16} fill='#8F9BB3' />
                            <Text category='c1' style={styles.dateText}>Hoy, 17 de Septiembre</Text>
                        </View>
                    </View>

                    {/* Stats Cards mejorados */}
                    <View style={styles.statsSection}>
                        <View style={styles.statsRow}>
                            <Card style={[styles.statCard, styles.primaryCard]}>
                                <View style={styles.statContent}>
                                    <View style={styles.statIconContainer}>
                                        <Icon name='shopping-bag-outline' width={24} height={24} fill='#FFFFFF' />
                                    </View>
                                    <Text category='h4' style={styles.statNumber}>124</Text>
                                    <Text category='c1' style={styles.statLabel}>Pedidos hoy</Text>
                                    <View style={styles.statTrend}>
                                        <Icon name='trending-up-outline' width={12} height={12} fill='#00E096' />
                                        <Text category='c2' style={styles.trendText}>+12%</Text>
                                    </View>
                                </View>
                            </Card>

                            <Card style={[styles.statCard, styles.secondaryCard]}>
                                <View style={styles.statContent}>
                                    <View style={[styles.statIconContainer, styles.secondaryIcon]}>
                                        <Icon name='people-outline' width={24} height={24} fill='#FFFFFF' />
                                    </View>
                                    <Text category='h4' style={styles.statNumber}>1,256</Text>
                                    <Text category='c1' style={styles.statLabel}>Usuarios</Text>
                                    <View style={styles.statTrend}>
                                        <Icon name='trending-up-outline' width={12} height={12} fill='#00E096' />
                                        <Text category='c2' style={styles.trendText}>+5%</Text>
                                    </View>
                                </View>
                            </Card>
                        </View>

                        <View style={styles.statsRow}>
                            <Card style={[styles.statCard, styles.accentCard]}>
                                <View style={styles.statContent}>
                                    <View style={[styles.statIconContainer, styles.accentIcon]}>
                                        <Icon name='credit-card-outline' width={24} height={24} fill='#FFFFFF' />
                                    </View>
                                    <Text category='h4' style={styles.statNumber}>$8,420</Text>
                                    <Text category='c1' style={styles.statLabel}>Ventas hoy</Text>
                                    <View style={styles.statTrend}>
                                        <Icon name='trending-up-outline' width={12} height={12} fill='#00E096' />
                                        <Text category='c2' style={styles.trendText}>+18%</Text>
                                    </View>
                                </View>
                            </Card>

                            <Card style={[styles.statCard, styles.warningCard]}>
                                <View style={styles.statContent}>
                                    <View style={[styles.statIconContainer, styles.warningIcon]}>
                                        <Icon name='activity-outline' width={24} height={24} fill='#FFFFFF' />
                                    </View>
                                    <Text category='h4' style={styles.statNumber}>94%</Text>
                                    <Text category='c1' style={styles.statLabel}>Rendimiento</Text>
                                    <View style={styles.statTrend}>
                                        <Icon name='trending-up-outline' width={12} height={12} fill='#00E096' />
                                        <Text category='c2' style={styles.trendText}>+2%</Text>
                                    </View>
                                </View>
                            </Card>
                        </View>
                    </View>

                    {/* Actividad Reciente mejorada */}
                    <Card style={styles.activityCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardTitleContainer}>
                                <Icon name='clock-outline' width={20} height={20} fill='#3366FF' />
                                <Text category='h6' style={styles.cardTitle}>Actividad Reciente</Text>
                            </View>
                            <Button 
                                size='tiny' 
                                appearance='ghost' 
                                onPress={() => {}}
                            >
                                Ver todo
                            </Button>
                        </View>
                        
                        <View style={styles.activityList}>
                            <View style={styles.activityItem}>
                                <View style={[styles.activityDot, styles.successDot]} />
                                <View style={styles.activityContent}>
                                    <Text category='s1' style={styles.activityTitle}>Nuevo pedido recibido</Text>
                                    <Text category='c1' style={styles.activityTime}>hace 2 minutos</Text>
                                </View>
                            </View>
                            
                            <View style={styles.activityItem}>
                                <View style={[styles.activityDot, styles.primaryDot]} />
                                <View style={styles.activityContent}>
                                    <Text category='s1' style={styles.activityTitle}>Pago procesado correctamente</Text>
                                    <Text category='c1' style={styles.activityTime}>hace 15 minutos</Text>
                                </View>
                            </View>
                            
                            <View style={styles.activityItem}>
                                <View style={[styles.activityDot, styles.infoDot]} />
                                <View style={styles.activityContent}>
                                    <Text category='s1' style={styles.activityTitle}>Nuevo usuario registrado</Text>
                                    <Text category='c1' style={styles.activityTime}>hace 1 hora</Text>
                                </View>
                            </View>
                        </View>
                    </Card>

                    {/* Acciones Rápidas */}
                    <Card style={styles.quickActionsCard}>
                        <Text category='h6' style={styles.sectionTitle}>Acciones Rápidas</Text>
                        <View style={styles.quickActionsRow}>
                            <Button 
                                style={styles.quickActionButton} 
                                appearance='outline'
                                accessoryLeft={(props) => <Icon {...props} name='plus-outline' />}
                                onPress={() => {}}
                            >
                                Nuevo
                            </Button>
                            <Button 
                                style={styles.quickActionButton} 
                                appearance='outline'
                                accessoryLeft={(props) => <Icon {...props} name='eye-outline' />}
                                onPress={() => {}}
                            >
                                Ver Todo
                            </Button>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    topNav: {
        elevation: 0,
        shadowOpacity: 0,
    },
    scrollContainer: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    
    // Header mejorado
    headerSection: {
        alignItems: 'center',
        marginBottom: 28,
        paddingTop: 10,
    },
    welcomeTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1A2138',
    },
    welcomeSubtitle: {
        color: '#8F9BB3',
        textAlign: 'center',
        marginBottom: 12,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    dateText: {
        marginLeft: 6,
        color: '#8F9BB3',
        fontWeight: '500',
    },

    // Stats Section
    statsSection: {
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        marginHorizontal: 6,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    primaryCard: {
        backgroundColor: '#3366FF',
    },
    secondaryCard: {
        backgroundColor: '#8F9BB3',
    },
    accentCard: {
        backgroundColor: '#00E096',
    },
    warningCard: {
        backgroundColor: '#FFAA00',
    },
    statContent: {
        alignItems: 'center',
        padding: 16,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    secondaryIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    accentIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    warningIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    statNumber: {
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    statTrend: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        color: '#00E096',
        marginLeft: 4,
        fontWeight: '600',
    },

    // Activity Card
    activityCard: {
        borderRadius: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        marginLeft: 8,
        fontWeight: '600',
    },
    activityList: {
        gap: 16,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: 12,
    },
    successDot: {
        backgroundColor: '#00E096',
    },
    primaryDot: {
        backgroundColor: '#3366FF',
    },
    infoDot: {
        backgroundColor: '#FFAA00',
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontWeight: '500',
        marginBottom: 2,
    },
    activityTime: {
        color: '#8F9BB3',
        fontSize: 12,
    },

    // Quick Actions
    quickActionsCard: {
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontWeight: '600',
        marginBottom: 16,
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    quickActionButton: {
        flex: 1,
        marginHorizontal: 8,
        borderRadius: 12,
    },
});