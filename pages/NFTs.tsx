
import * as React from "react";
import { View, Text, Image, StyleSheet, SafeAreaView } from "react-native"
import Wallet from '../Wallet'
import { FakeNav } from "../Types"
import { Button } from '../views'
import { Metadata } from "@metaplex-foundation/js";
import { sleep } from "../lib/util";
import { Props } from '../lib/react/types'
import LinearGradient from 'react-native-linear-gradient'


const NftView = ({ nft }: { nft: Metadata }) => (
    <View style={styles.item}>
        <Text style={styles.nftTitle}>{nft.json!.name}</Text>
        <Image
            style={ styles.nftImage }
            source={{ uri: nft.json!.image || undefined }} />
    </View>
)

export default function NFTs({ navigation }: Props<'NFTs'>) {

    const [nfts, setNfts] = React.useState<Metadata[]>([])

    const loadNfts = async () => {
        const wallet = (await Wallet.shared())!
        setNfts([await wallet.getMercedes(), await wallet.getTwitter()].filter(x => !!x) as Metadata[])
    }

    const loadDataTwice = async () => {
        await loadNfts()
        await sleep(500)
        await loadNfts()
    }

    React.useEffect(() => navigation.addListener('focus', loadDataTwice), [])

    React.useEffect(() => {
        loadDataTwice()
        return navigation.addListener('focus', loadNfts)
    }, [])

    return (
      <LinearGradient
        start={{ x: 0.0, y: 0.0 }} end={{x: 1.2, y: 1.0}}
        locations={[ 0.0, 0.3, 0.65, 1.0 ]}
        colors={['#5504F1', '#FF48C0', '#FF88BB', '#FF2D1D']}
        style={{ height: '100%', width: '100%' }}>
        <SafeAreaView style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', height: '100%', width: '100%', padding: 20 }}>
            <Button onPress={() => navigation.goBack()} medium backgroundColor="white" textColor="#550451" textStyle={{ fontWeight: 'normal' }} style={{ opacity: 0.4, width: 100, marginBottom: 40 }}>DONE</Button>
              <Text style={styles.header}>Your NFTs</Text>
              {(!nfts || !nfts.length) && <Text>No NFTs in your wallet</Text>}
              {nfts.map(nft => <NftView key={nft.mintAddress.toString()} nft={nft}/>)}
          </SafeAreaView>
      </LinearGradient>
    );
  }


const styles = StyleSheet.create({
    header: {
        marginTop: 10, marginBottom: 20, fontWeight: 'bold', fontSize: 20, color: 'black'
    },

    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'white',
        //marginTop: StatusBar.currentHeight || 0
    },

    list: {
        alignSelf: 'stretch', flexDirection: 'column', alignItems: 'center', bottom: 0, marginBottom: 30
    },

    logo: {
        width: 60, height: 60, marginLeft: 20, marginTop: 40
    },

    item: {
      padding: 16,
      marginRight: 'auto',
      marginLeft: 'auto',
      marginTop: 20,
      alignItems: 'center',
      backgroundColor: '#F4401F',
      borderRadius: 2
    },

    nftImage: {
        height: 250, width: 250, borderRadius: 2, borderColor: 'white', borderWidth: 2
    },

    nftTitle: {
        marginBottom: 10, fontWeight: "bold", color: "white"
    },
    
    offer: {
        backgroundColor: 'black',
        paddingVertical: 20,
        paddingHorizontal: 30,
        borderRadius: 1
    },

    offerTitle: {
        marginBottom: 20,
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white'
    },

    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 22,
        height: 44,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4401F',
    },

    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 25,
        marginRight: 25,
        textTransform: 'uppercase'
    },

    message: {
        textAlign: 'center',
        marginVertical: 30,
    },
  })