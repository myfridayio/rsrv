import AsyncStorage from "@react-native-async-storage/async-storage"
import * as React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"
import Wallet from './Wallet'
import { FakeNav } from "./Types"
import { Button } from './views'
import { Metadata } from "@metaplex-foundation/js";
import { sleep } from "./lib/util";


const NftView = ({ nft }: { nft: Metadata }) => (
    <View style={styles.item}>
        <Text style={styles.nftTitle}>{nft.json!.name}</Text>
        <Image
            style={ styles.nftImage }
            source={{ uri: nft.json!.image || undefined }} />
    </View>
)

export default function Dashboard({ navigation }: { navigation: FakeNav }) {

    const [nfts, setNfts] = React.useState<Metadata[]>([])
    const [message, setMessage] = React.useState("")
    const [shouldOffer, setShouldOffer] = React.useState(true)

    const checkEligibility = () => {
        AsyncStorage.getItem('@Friday:mercedes:ineligible')
        .then(ineligibleDate => { if (ineligibleDate) { setShouldOffer(false) } })
        AsyncStorage.getItem('@Friday:mercedes:eligible')
        .then(eligibleDate => { if (eligibleDate) { setShouldOffer(false) } })
    }

    const loadNfts = async () => {
        const wallet = await Wallet.shared()
        setNfts([await wallet.getMercedes(), await wallet.getTwitter()].filter(x => !!x) as Metadata[])
    }

    const loadData = async () => {
        await Promise.all([loadNfts(), checkEligibility()])
    }

    const loadDataTwice = async () => {
        await loadData()
        await sleep(500)
        await loadData()
    }

    React.useEffect(() => navigation.addListener('focus', loadDataTwice), [])

    React.useEffect(() => {
        loadData()
        return navigation.addListener('focus', loadData)
    }, [])

    nfts.forEach(nft => {
        console.log(`https://explorer.solana.com/address/${nft.mintAddress.toString()}?cluster=devnet`)
    })

    return (
        <View style={styles.container}>
            <View>
                <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
                    <Image style={styles.logo} resizeMode='stretch' source={require('./images/friday_logo.png')}/>
                </TouchableOpacity>
            </View>
            <View style={{ alignSelf: 'stretch', flexDirection: 'column', alignItems: 'center', bottom: 0, marginBottom: 30 }}>
                {shouldOffer &&
                <View style={styles.offer}>
                    <Text style={styles.offerTitle}>Mercedes F1 Team Badge</Text>
                    <Image
                        style={{ width: 250, height: 250 }}
                        resizeMode='stretch'
                        source={require('./images/collection-mercedes.png')}
                    />
                    <Button style={{ marginTop: 20 }} onPress={() => navigation.navigate('Mercedes')}>Check Eligibility</Button>
                </View>}
                {nfts.map(nft => <NftView key={nft.mintAddress.toString()} nft={nft}/>)}
                {/*
                <TouchableOpacity style={{  }} onPress={() => navigation.navigate('NetflixConnect')}>
                    <Image
                        style={{ width: 100, height: 100 }}
                        resizeMode='stretch'
                        source={require('./images/netflix_icon.png')}
                    />
                </TouchableOpacity>
            */}
            </View>
            <View/>
            <Text style={styles.message}>{message || ''}</Text>
        </View>
    );
  }


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'white',
        //marginTop: StatusBar.currentHeight || 0
    },

    logo: {
        width: 60, height: 60, marginLeft: 20, marginTop: 40
    },

    item: {
      padding: 16,
      marginRight: 'auto',
      marginLeft: 'auto',
      marginTop: 30,
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