
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Metaplex, keypairIdentity, bundlrStorage, Nft, Metadata } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";

export interface NftInfo {
    json: {
        image: string | null,
        name: string,
    },
    mintAddress: PublicKey,
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
        const allNFTs = await metaplex.nfts().findAllByOwner({owner: owner}) as Metadata[]

        const info: NftInfo[] = (await Promise.all(allNFTs.map(async (nft: Metadata) => {
            console.log('GOT ONE')
            console.log(nft)
            const response = await fetch(nft.uri)
            const json = (await response.json()) as { image: string | null, name: string }
            console.log(Object.keys(nft.mintAddress), nft.mintAddress, nft.mintAddress.toString())
            return { ...nft, json } as NftInfo
        }))).filter(x => !!x)

        return info
    }
}