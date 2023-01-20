import * as React from "react";
import { View, TextInput, Button, Image, Text } from "react-native";

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
        <View style={{ flex: 1 }}>
            <Image
                style={{ width: '100%', height: '100%'}}
                resizeMode='cover'
                source={require('./images/getstarted.png')}
            />
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 20}}>
                <Button
                    onPress={() => navigation.navigate('About')}
                    title="Generate"
                    color="black"       
                />
            </View>
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', top: 0, marginTop: 220}}>
                <TextInput
                    style={{height: 40, backgroundColor: 'black'}}
                    autoCapitalize='none'
                    placeholder="Your Twitter handle name here"
                    onChangeText={newText => setTwitterUserName(newText)}
                    //defaultValue={twitterUserName}
                    onSubmitEditing={()=>getTwitterId()}
                />
            </View>
            <View style={{position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 70}}>
                <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>{centerText}</Text>
            </View>
      </View>
    );
  }