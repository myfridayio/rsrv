import * as React from "react";
import { Image, StyleSheet, View, Text, Linking, TouchableOpacity } from "react-native"
import LinearGradient from "react-native-linear-gradient";
import { Props } from "../lib/react/types";
import ConfettiCannon from 'react-native-confetti-cannon';

const paleWhite = 'rgba(255,255,255,0.2)'
const paleDarkBlue = 'rgba(0,05,10,0.2)'

export default function Score({ route, navigation }: Props<'Score'>) {
  const response = route.params.response
   return (
      <LinearGradient
        start={{ x: 0.0, y: 0.0 }} end={{x: 1.2, y: 1.0}}
        locations={[ 0.0, 0.3, 0.65, 1.0 ]}
        colors={['#05D3D1', '#00B6C3', '#004C91', '#001840']}
        style={{ height: '100%', width: '100%' }}>
        <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}>
            <View style={{ padding: 15, backgroundColor: paleWhite, marginVertical: 20, borderRadius: 20 }}>
              <Image style={{width: 300, height: 300, borderRadius: 10 }} source={{uri: response.imageUri}}/>

            </View>
            <TouchableOpacity
              style={{ paddingVertical: 20, paddingHorizontal: 30, borderRadius: 25,  justifyContent: 'center', alignItems: 'center', backgroundColor: paleDarkBlue }}
              onPress={() => Linking.openURL(response.exploreUri)}
            >
              <Text style={{ fontFamily: 'Helvetica', color: '#2acec6' }}>View on Solana</Text>
            </TouchableOpacity>
            <ConfettiCannon
                count={300}
                origin={{x: -10, y: 0}}
            />
        </View>
      </LinearGradient>
    );
  }


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'white'
    },
  })