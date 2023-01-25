import * as React from "react";
import { View, Text, Button, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from './Home'
import AboutScreen from './About'
import CreateWallet from "./CreateWallet";
import WalletAddressScreen from "./WalletAddress";
import TwitterConnectScreen from "./TwitterConnect";
import MoreTokensConnectScreen from "./MoreTokensConnect";
import TwitterScreen from "./TwitterScreen";
import Dashboard from "./Dashboard";
import NFTGallery from "./NFTGallery";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="About" screenOptions={{
    headerShown: false
  }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="CreateWallet" component={CreateWallet} />
        <Stack.Screen name="WalletAddress" component={WalletAddressScreen} />
        <Stack.Screen name="TwitterConnect" component={TwitterConnectScreen} />
        <Stack.Screen name="MoreTokensConnect" component={MoreTokensConnectScreen} />
        <Stack.Screen name="TwitterScreen" component={TwitterScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="NFTGallery" component={NFTGallery} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}