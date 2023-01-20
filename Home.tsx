import * as React from "react";
import { View, Text, Button, Image } from "react-native";

export default function HomeScreen({navigation}) {

    
    return (
        <View style={{ flex: 1 }}>
            <Image
                style={{ width: '100%', height: '100%'}}
                resizeMode='stretch'
                source={require('./images/getstarted.png')}
            />
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 20}}>
                <Button
                    onPress={() => navigation.navigate('About')}
                    title="Get Started"
                    color="black"       
                />
            </View>
      </View>
    );
  }