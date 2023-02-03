import * as React from "react";
import 'react-native-url-polyfill/auto'
import { View, Image, FlatList, Text, StyleSheet, StatusBar } from "react-native";
import Wallet, { NftInfo } from "./Wallet";


export default function NFTGallery({navigation}) {
    const [centerMessage, setCenterMessage] = React.useState("")
    const [nftsLoaded, setNftsLoaded] = React.useState(false)
    const [nftUrls, setNftUrls] = React.useState<NftInfo[]>([])

    React.useEffect(() => {
        setCenterMessage('Loading NFTs...')
        Wallet.shared().then(async (wallet) => {
            const urls = await wallet.getNftInfo()
            console.log(urls)
            setNftUrls(urls)
            setNftsLoaded(true)
        })
        .catch(error => {
            console.error(error)
            setCenterMessage('Error loading NFTs!')
        })
    }, [])

    const Item = (nft: NftInfo) => (
        <View style={styles.item}>
            <Text>{nft.name}</Text>
          <Image
            style={{ height: 150, width: 150 }}
            source={{ uri: nft.image }} />
        </View>
    )

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Image
                style={{ width: 60, height: 60, marginLeft: 20, marginTop: 40 }}
                resizeMode='stretch'
                source={require('./images/friday_logo.png')}
            />
        {
            nftsLoaded ?
                <FlatList
                    style={{ marginVertical: 20 }}
                    data={nftUrls}
                    renderItem={({item}) => <Item image={item.image} name={item.name} />} />
             :
             <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: '#ef390f', fontWeight: 'bold' }}>
                  {centerMessage}
                </Text>
             </View>
        }
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: StatusBar.currentHeight || 0,
    },
    item: {
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      alignItems: 'center'
    },
    title: {
      fontSize: 32,
    },
  });
