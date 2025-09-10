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
                {/* Botón de ingresar por huella */}
                <Layout style={{ marginTop: 10 }}>
                    <Button
                        appearance="outline"
                        accessoryLeft={<MyIcon name="smiling-face-outline" />}
                        onPress={() => { }}
                    >Ingresar por huella</Button>
                </Layout>
                {/* Botón de ingresar por FaceID */}
                <Layout style={{ marginTop: 10 }}>
                    <Button
                        appearance="outline"
                        accessoryLeft={<MyIcon name="smiling-face-outline" />}
                        onPress={() => { }}
                    >Ingresar por FaceID</Button>
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
