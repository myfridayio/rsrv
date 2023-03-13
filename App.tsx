import * as React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from './Home'
import AboutScreen from './About'
import CreateWallet from "./CreateWallet"
import WalletAddressScreen from "./WalletAddress"
import TwitterConnectScreen from "./TwitterConnect"
import MoreTokensConnectScreen from "./MoreTokensConnect"
import TwitterScreen from "./TwitterScreen"
import Dashboard from "./Dashboard"
import NetflixConnect from "./NetflixConnect"
import Mercedes from './Mercedes'
import Menu from './Menu'
import { Connect, NFTs } from "./pages"

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Connect" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="CreateWallet" component={CreateWallet} />
        <Stack.Screen name="WalletAddress" component={WalletAddressScreen} />
        <Stack.Screen name="TwitterConnect" component={TwitterConnectScreen} />
        <Stack.Screen name="MoreTokensConnect" component={MoreTokensConnectScreen} />
        <Stack.Screen name="TwitterScreen" component={TwitterScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="NetflixConnect" component={NetflixConnect} />
        <Stack.Screen name="Mercedes" component={Mercedes} />
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="Connect" component={Connect} />
        <Stack.Screen name="NFTs" component={NFTs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}