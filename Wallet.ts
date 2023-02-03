
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Metaplex, keypairIdentity, bundlrStorage, Nft, FindNftsByOwnerOutput } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";

export interface NftInfo {
    image?: string,
    name: string
}

export default class Wallet {

    isLoaded: boolean = false
    publicKey: string | null = null
    lastError: string | null = null

    private constructor() {
    }

    private static _shared: Wallet | null
    static async shared(): Promise<Wallet> {
        if (!this._shared) {
            const wallet = new Wallet()
            this._shared = wallet
            await wallet.load()
        }
        return this._shared
    }

    async load(cycle=0): Promise<Wallet> {
        if (this.isLoaded) {
            return this
        }
        await AsyncStorage.getItem('@MyWalletAddress:key')
        .then((publicKey: string | null) => {
            this.isLoaded = true
            this.publicKey = publicKey || this.publicKey
        })
        return this
    }


    async getNftInfo(): Promise<NftInfo[]> {
        const wallet = await this.load()
        if (!wallet.publicKey) {
            return []
        }
        const connection = new Connection(clusterApiUrl("devnet"))
        const tempKeypair = Keypair.generate() // should this be my keypair? confused...

        const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(tempKeypair))
            .use(bundlrStorage())

        const owner = new PublicKey(wallet.publicKey!)
        const allNFTs: Nft[] = await metaplex.nfts().findAllByOwner({owner: owner}) as Nft[]

        const nftUrls: NftInfo[] = (await Promise.all(allNFTs.map(async (nft) => {
            console.log('GOT ONE', nft)
            const response = await fetch(nft.uri)
            const json = await response.json()
            return { image: json.image, name: json.name } as NftInfo
        }))).filter(x => !!x)

        return nftUrls
    }
}