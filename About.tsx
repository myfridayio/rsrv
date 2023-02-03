import * as React from "react";
import { View, Text, Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AboutScreen({navigation}) {

    React.useEffect(() => {
        async function getWalletAddress() {
            try {
                const address = await AsyncStorage.getItem('@MyWalletAddress:key');
                if (address !== null) {
                  setTimeout(() => {
                    navigation.navigate('Dashboard')
                  }, 1000)
                } else {
                    setTimeout(() => {
                        navigation.navigate('Home')
                    }, 1000)
                }
              } catch (error) {
                navigation.navigate('Home')
              }
        }
        getWalletAddress()
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: "#ef390f" }}>
            <View style={{ flex: 1, position: 'absolute', width: '100%', marginTop: 100, alignItems: 'center' }}>
                <Image
                    style={{ width: 80, height: 80, borderWidth: 1, borderColor: 'white' }}
                    resizeMode='stretch'
                    source={require('./images/friday_logo.png')}
                />
            </View>
      </View>
    );
  }
