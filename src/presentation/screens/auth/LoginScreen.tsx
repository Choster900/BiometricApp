import { useState, useEffect } from "react";
import * as Keychain from 'react-native-keychain';
import { MyIcon } from "../../components/ui/MyIcon";
import { ScrollView } from "react-native-gesture-handler"
import { StackScreenProps } from "@react-navigation/stack";
import { useAuthStore } from "../../store/auth/useAuthStore";
import { Button, Input, Layout, Text } from "@ui-kitten/components"
import { RootStackParamList } from "../../navigation/StackNavigator";
import { Alert, useWindowDimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";

interface Props extends StackScreenProps<RootStackParamList, 'LoginScreen'> { }

export const LoginScreen = ({ navigation }: Props) => {

    const { login, loginWithBiometrics } = useAuthStore();

    const [form, setForm] = useState({ email: '', password: '' });
    const [hasBiometricCredentials, setHasBiometricCredentials] = useState(false);

    const { height } = useWindowDimensions();

    // Verificar si existen credenciales biométricas al cargar el componente
    useEffect(() => {
        const checkBiometricSupportAndCredentials = async () => {
            const biometryType = await Keychain.getSupportedBiometryType();
            console.log('Supported Biometry Type:', biometryType);

            try {
                const credentials = await Keychain.hasGenericPassword();
                setHasBiometricCredentials(credentials);
            } catch (error) {
                console.log('Error checking biometric credentials:', error);
                setHasBiometricCredentials(false);
            }
        };

        checkBiometricSupportAndCredentials();
    }, []);

    const onLogin = async () => {
        const result = await login(form.email, form.password);

        console.log(result)
        if (result) {
            return;
        }

        Alert.alert('Login incorrecto', 'Revise sus credenciales');
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Layout style={{ flex: 1 }}>
                    <ScrollView
                        style={{ paddingHorizontal: 32 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <Layout style={{
                            paddingTop: height * 0.12,
                            marginBottom: 48,
                            backgroundColor: 'transparent'
                        }}>
                            <Text
                                category="h2"
                                style={{
                                    fontWeight: '600',
                                    marginBottom: 8,
                                }}
                            >
                                Bienvenido
                            </Text>
                            <Text
                                category="p1"
                                style={{
                                    fontSize: 16
                                }}
                            >
                                Ingresa a tu cuenta
                            </Text>
                        </Layout>

                        {/* Form */}
                        <Layout style={{ backgroundColor: 'transparent' }}>
                            <Input
                                value={form.email}
                                onChangeText={(text) => setForm({ ...form, email: text })}
                                accessoryLeft={<MyIcon name="email-outline" />}
                                placeholder="Correo electrónico"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={{
                                    marginBottom: 16,
                                    borderRadius: 12
                                }}
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    // Focus next input (password)
                                }}
                            />
                            <Input
                                value={form.password}
                                onChangeText={(text) => setForm({ ...form, password: text })}
                                accessoryLeft={<MyIcon name="lock-outline" />}
                                placeholder="Contraseña"
                                secureTextEntry
                                autoCapitalize="none"
                                returnKeyType="done"
                                onSubmitEditing={onLogin}
                                style={{
                                    borderRadius: 12
                                }}
                            />
                        </Layout>

                        {/* Login Button */}
                        <Layout style={{
                            marginTop: 32,
                            backgroundColor: 'transparent'
                        }}>
                            <Button
                                onPress={onLogin}
                                style={{
                                    borderRadius: 12,
                                    paddingVertical: 4,
                                    elevation: 0,
                                    shadowOpacity: 0
                                }}
                                size="large"
                            >
                                Ingresar
                            </Button>
                        </Layout>

                        {/* Biometric Authentication */}
                        {hasBiometricCredentials && (
                            <Layout style={{
                                marginTop: 32,
                                backgroundColor: 'transparent'
                            }}>
                                {/* Divider */}
                                <Layout style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginVertical: 24,
                                    backgroundColor: 'transparent'
                                }}>
                                    <Layout style={{
                                        flex: 1,
                                        height: 1,
                                        backgroundColor: '#e5e5e5'
                                    }} />
                                    <Text
                                        category="c1"
                                        style={{
                                            color: '#999',
                                            marginHorizontal: 16,
                                            fontSize: 14
                                        }}
                                    >
                                        o continúa con
                                    </Text>
                                    <Layout style={{
                                        flex: 1,
                                        height: 1,
                                        backgroundColor: '#e5e5e5'
                                    }} />
                                </Layout>

                                {/* Biometric Buttons */}
                                <Layout style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: 16,
                                    backgroundColor: 'transparent'
                                }}>
                                    <TouchableWithoutFeedback onPress={() => loginWithBiometrics()}>
                                        <Layout style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 28,
                                            backgroundColor: '#f8f9fa',
                                            borderWidth: 1,
                                            borderColor: '#e9ecef',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            elevation: 0
                                        }}>
                                            <MyIcon
                                                name="unlock-outline"
                                            />
                                        </Layout>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback onPress={() => loginWithBiometrics()}>
                                        <Layout style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 28,
                                            backgroundColor: '#f8f9fa',
                                            borderWidth: 1,
                                            borderColor: '#e9ecef',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            elevation: 0
                                        }}>
                                            <MyIcon
                                                name="person-outline"
                                            />
                                        </Layout>
                                    </TouchableWithoutFeedback>
                                </Layout>
                            </Layout>
                        )}

                        {/* Register Link */}
                        <Layout style={{
                            alignItems: 'center',
                            marginTop: 48,
                            marginBottom: 32,
                            backgroundColor: 'transparent'
                        }}>
                            <Layout style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: 'transparent'
                            }}>
                                <Text style={{ color: '#666', fontSize: 15 }}>
                                    ¿No tienes cuenta?{' '}
                                </Text>
                                <TouchableWithoutFeedback
                                    onPress={() => navigation.replace('RegisterScreen')}
                                >
                                    <Text
                                        style={{
                                            color: '#007AFF',
                                            fontSize: 15,
                                            fontWeight: '500'
                                        }}
                                    >
                                        Regístrate
                                    </Text>
                                </TouchableWithoutFeedback>
                            </Layout>
                        </Layout>
                    </ScrollView>
                </Layout>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}
