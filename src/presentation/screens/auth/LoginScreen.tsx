import { Button, Input, Layout, Text } from "@ui-kitten/components"
import { Alert, useWindowDimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { ScrollView } from "react-native-gesture-handler"
import { MyIcon } from "../../components/ui/MyIcon";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { API_URL } from "@env";
import { useState } from "react";
import { useAuthStore } from "../../store/auth/useAuthStore";

interface Props extends StackScreenProps<RootStackParamList, 'LoginScreen'> { }


export const LoginScreen = ({ navigation }: Props) => {

    const { login } = useAuthStore();

    const [form, setForm] = useState({ email: '', password: '' });

    const { height } = useWindowDimensions();

    const onLogin = async () => {
        const result = await login(form.email, form.password);
        if (result) return;


        Alert.alert('Login incorrecto', 'Revise sus credenciales');
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Layout style={{ flex: 1 }}>
                    <ScrollView style={{ marginHorizontal: 40 }} keyboardShouldPersistTaps="handled">
                        <Layout style={{ paddingTop: height * 0.25 }}>
                            <Text category="h1">Ingresar</Text>
                            <Text category="p2">Por favor, ingrese para continuar</Text>
                        </Layout>
                        <Layout style={{ marginTop: 20 }}>
                            <Input
                                value={form.email}
                                onChangeText={(text) => setForm({ ...form, email: text })}
                                accessoryLeft={<MyIcon name="email-outline" />}
                                placeholder="Correo electrónico"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={{ marginBottom: 10 }}
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
                            />
                        </Layout>
                        <Text>{JSON.stringify(form)}</Text>
                        {/* Space */}
                        <Layout style={{ height: 20 }} />
                        <TouchableWithoutFeedback onPress={onLogin}>
                            <Layout>
                                <Button
                                    accessoryRight={<MyIcon name="arrow-forward-outline" />}
                                    onPress={onLogin}
                                >Ingresar</Button>
                            </Layout>
                        </TouchableWithoutFeedback>

                {/* Separador visual */}
                <Layout style={{ marginVertical: 20, alignItems: 'center' }}>
                    <Text category="c1" appearance="hint">o ingresa con</Text>
                </Layout>

                {/* Botones de autenticación biométrica */}
                <Layout style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10 }}>
                    {/* Botón de ingresar por huella */}
                    <Layout style={{ flex: 1, marginRight: 5 }}>
                        <Button
                            appearance="outline"
                            status="info"
                            accessoryLeft={<MyIcon name="hash-outline" />}
                            onPress={() => { }}
                            style={{
                                borderRadius: 12,
                                paddingVertical: 12
                            }}
                        >Huella</Button>
                    </Layout>

                    {/* Botón de ingresar por FaceID */}
                    <Layout style={{ flex: 1, marginLeft: 5 }}>
                        <Button
                            appearance="outline"
                            status="info"
                            accessoryLeft={<MyIcon name="eye-outline" />}
                            onPress={() => { }}
                            style={{
                                borderRadius: 12,
                                paddingVertical: 12
                            }}
                        >Face ID</Button>
                    </Layout>
                </Layout>
                {/* Space */}
                <Layout style={{ height: 20 }} />
                <Layout style={{
                    alignItems: 'flex-end',
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <Text>¿No tienes una cuenta?</Text>
                    <Text category="s1" status="primary" onPress={() => navigation.replace('RegisterScreen')}>
                        {''}
                        Crea una
                        {''}
                    </Text>
                </Layout>
                    </ScrollView>
                </Layout>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}
