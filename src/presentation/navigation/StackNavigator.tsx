
import { createStackNavigator, StackCardStyleInterpolator } from '@react-navigation/stack';
import { LoadingScreen } from '../screens/loading/LoadingScree';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { DrawerNavigator } from './DrawerNavigator';


export type RootStackParamList = {
    DrawerNavigator: undefined;
    LoginScreen: undefined;
    RegisterScreen: undefined;
    LoadingScreen: undefined;
};

const fadeAnimation: StackCardStyleInterpolator = ({ current }) => ({
    cardStyle: {
        opacity: current.progress,
    },
});

const Stack = createStackNavigator<RootStackParamList>();

export const StackNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="LoadingScreen"
            screenOptions={{
                headerShown: false,
                //cardStyleInterpolator: fadeAnimation,
            }}>

            <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
            <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        </Stack.Navigator>
    )
}
