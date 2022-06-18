import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';
import 'react-native-get-random-values'
import AddFarmScreen from '../screens/AddFarmScreen';
import FarmListScreen from '../screens/FarmListScreen';
import Login from '../screens/login';
import SignUp from '../screens/signUp'

console.disableYellowBox = true;


//navigation container
export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

//create stack for Navigation.
const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="signup" component={SignUp} options={{ headerShown: false }} />
      <Stack.Screen name="addFarm" component={AddFarmScreen} options={{ headerShown: false }} />
      <Stack.Screen name="farmList" component={FarmListScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
