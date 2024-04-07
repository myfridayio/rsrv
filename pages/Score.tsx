import * as React from "react";
import { Image, StyleSheet, View, Text } from "react-native"
import LinearGradient from "react-native-linear-gradient";
import { Props } from "../lib/react/types";
import ConfettiCannon from 'react-native-confetti-cannon';

export default function Score({ route, navigation }: Props<'Score'>) {
    //{route.params.score}
   return (
      <LinearGradient
        start={{ x: 0.0, y: 0.0 }} end={{x: 1.2, y: 1.0}}
        locations={[ 0.0, 0.3, 0.65, 1.0 ]}
        colors={['#05D3D1', '#00B6C3', '#004C91', '#001840']}
        style={{ height: '100%', width: '100%' }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}>
            <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold'}}>YOUR RSRV SCORE</Text>
            <Text style={{fontSize: 100, color: 'white', fontWeight: 'bold'}}>{route.params.score}</Text>
            <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold', marginTop: 100}}>This is your NFT</Text>
            <Image style={{width: 150, height: 150, marginTop: 20}} source={{uri: route.params.imageUrl}}/>
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