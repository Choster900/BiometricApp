import { Button, Input, Layout, Text } from "@ui-kitten/components"
import { useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler"
import { MyIcon } from "../../components/ui/MyIcon";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";

interface Props extends StackScreenProps<RootStackParamList, 'RegisterScreen'> { }


export const RegisterScreen = ({ navigation }: Props) => {

    const { height } = useWindowDimensions();
    return (
        <Layout style={{ flex: 1 }}>
            <ScrollView style={{ marginHorizontal: 40 }}>

                <Layout style={{ paddingTop: height * 0.25 }}>
                    <Text category="h1">Registrarse</Text>
                    <Text category="p2">Crea tu cuenta para comenzar</Text>
                </Layout>

                <Layout style={{ marginTop: 20 }}>
                    <Input accessoryLeft={<MyIcon name="person-outline" />} placeholder="Nombre completo" autoCapitalize="words" style={{ marginBottom: 10 }} />
                    <Input accessoryLeft={<MyIcon name="email-outline" />} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" style={{ marginBottom: 10 }} />
                    <Input accessoryLeft={<MyIcon name="lock-outline" />} placeholder="Contraseña" secureTextEntry autoCapitalize="none" />
                </Layout>

                {/* Space */}
                <Layout style={{ height: 20 }} />

                <Layout>
                    <Button
                        accessoryRight={<MyIcon name="arrow-forward-outline" />}
                        onPress={() => { }}
                    >Registrarse</Button>
                </Layout>

                {/* Space */}
                <Layout style={{ height: 20 }} />

                <Layout style={{
                    alignItems: 'flex-end',
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <Text>¿Ya tienes una cuenta?</Text>
                    <Text category="s1" status="primary" onPress={() => navigation.replace('LoginScreen')}>
                        {''}
                        Inicia sesión
                        {''}
                    </Text>
                </Layout>



            </ScrollView>
        </Layout>
    )
}
