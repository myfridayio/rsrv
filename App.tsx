import * as React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Connect, NFTs } from "./pages"
import Intro from "./pages/Intro";
import Score from "./pages/Score";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Intro" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Intro" component={Intro} />
        <Stack.Screen name="Connect" component={Connect} options={{ animation: 'fade' }}/>
        <Stack.Screen name="NFTs" component={NFTs} />
        <Stack.Screen name="Score" component={Score} options={{ animation: 'fade' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}