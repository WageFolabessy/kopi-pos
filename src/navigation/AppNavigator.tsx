import { NavigationContainer } from "@react-navigation/native";
import {
    createNativeStackNavigator,
    NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React from "react";

import CashierScreen from "../screens/CashierScreen";
import DashboardScreen from "../screens/DashboardScreen";
import LoginScreen from "../screens/LoginScreen";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Cashier: { transactionId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Cashier" component={CashierScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

export type LoginScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Login"
>;
export type DashboardScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Dashboard"
>;
export type CashierScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Cashier"
>;
