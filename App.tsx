import * as React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Connect, NFTs } from "./pages"

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Connect" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Connect" component={Connect} />
        <Stack.Screen name="NFTs" component={NFTs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}