import * as React from "react";
import { View, TextInput, TouchableOpacity, Image, Text, KeyboardAvoidingView } from "react-native";

export default function TwitterConnectScreen({navigation}) {

    const [twitterUserName, setTwitterUserName] = React.useState("");
    const [twitterId, setTwitterId] = React.useState("");
    const [centerText, setCenterText] = React.useState("");
    const token = 'AAAAAAAAAAAAAAAAAAAAAA7TjwEAAAAAjQjSffSrlDSlMU2E8iVIbRzO2iw%3DrA7RWtjtutQYqwwMfQeXUQ2kPjRC4pZ0G4POVJnEMlHkceoaqj'

    const getTwitterId = () => {
        if(twitterUserName != "") {
        return fetch(`https://api.twitter.com/2/users/by/username/${twitterUserName}`, {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${token}`,
            },
        })
        .then(response => response.json())
        .then(json => {
            setTwitterId(json.data.id)
            setTimeout(() => getFollowerCount(), 500)
        })
        .catch((error) => {
           
        });
        }
    }

    const getFollowerCount = () => {
        console.log('twitter id - '+twitterId)
        if(twitterId != "") {
          return fetch(`https://api.twitter.com/2/users/${twitterId}/following`, {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${token}`,
            },
          })
          .then(response => response.json())
          .then(json => {
            //setFollowerCount(`Total Followers - ${json.meta.result_count}`)
            //setTimeout(() => getFollowingCount(), 500)
            console.log(JSON.stringify(json))
            let list: string[] = [];
            json.data.forEach((element: { username: string; }) => {
                list.push(element.username);
                console.log(element.username)
            });
            if(list.includes('MercedesAMGF1')&&list.includes('LewisHamilton')&&list.includes('GeorgeRussell63')) {
                console.log('You are a true fan. You are entitled to get a twitter nft and a Mercedes NFT')
                setCenterText('You are a true fan. You are entitled to get a twitter NFT and a Mercedes NFT')
            } else {
                console.log('you only get a twitter nft')
                setCenterText('You are only entitled to get a twitter NFT')
            }

          })
          .catch((error) => {
            //setFollowerCount('Something went wrong with followers count');
          });
        }
      }

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <Image
                    style={{ width: 60, height: 60, marginLeft: 20, marginTop: 40 }}
                    resizeMode='stretch'
                    source={require('./images/friday_logo.png')}
                />
                <Text style={{ marginTop: 50, fontSize: 60, marginLeft: 40, fontFamily: 'AkzidenzGroteskBQ-BdCnd', color: '#ef390f' }}>CONNECT YOUR TWITTER ACCOUNT</Text>
                <TextInput
                        style={{height: 40, backgroundColor: '#f0f0f0', marginTop: 50, marginHorizontal: 40, color: "black"}}
                        autoCapitalize='none'
                        placeholderTextColor="#000000"
                        placeholder="  Your Twitter handle name here"
                        onChangeText={newText => setTwitterUserName(newText)}
                        onSubmitEditing={()=>getTwitterId()}
                    />
                <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 30}}>
                    <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: '600', marginHorizontal: 30, marginBottom: 10 }}>{centerText}</Text>
                    <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25, borderWidth: 1 }}>
                        <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>Generate NFTs</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
  }