import * as React from "react";
import { Image, StyleSheet, View, Text, Linking, TouchableOpacity } from "react-native"
import LinearGradient from "react-native-linear-gradient";
import { Props } from "../lib/react/types";
import ConfettiCannon from 'react-native-confetti-cannon';

const paleWhite = 'rgba(255,255,255,0.1)'

export default function Score({ route, navigation }: Props<'Score'>) {
  const response = route.params.response
   return (
      <LinearGradient
        start={{ x: 0.0, y: 0.0 }} end={{x: 1.2, y: 1.0}}
        locations={[ 0.0, 0.3, 0.65, 1.0 ]}
        colors={['#05D3D1', '#00B6C3', '#004C91', '#001840']}
        style={{ height: '100%', width: '100%' }}>
        <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}>
            <Text style={{fontSize: 100, color: '#ef3d67', fontWeight: 'bold'}}>{Math.round(response.scores.repaymentLikelihood*1000)/100}%</Text>
            <Image style={{width: 300, height: 300, marginVertical: 20, borderWidth: 10, borderColor: paleWhite }} source={{uri: response.imageUri}}/>
            <TouchableOpacity
              style={{ padding: 20, borderRadius: 20,  justifyContent: 'center', alignItems: 'center' }}
              onPress={() => Linking.openURL(response.exploreUri)}
            >
              <Text>View on Solana</Text>
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