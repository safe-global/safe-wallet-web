import ExternalStore from '@/services/ExternalStore'
import { Web3Auth } from '@web3auth/modal'

import { WEB3AUTH_CLIENT_ID } from '@/config/constants'
import { useEffect } from 'react'

const {
  getStore: getWeb3AuthStore,
  setStore: setWeb3AuthStore,
  useStore: useWeb3AuthStore,
} = new ExternalStore<Web3Auth>()

let initializing = false

export const useInitWeb3Auth = () => {
  useEffect(() => {
    //Initialize within your constructor
    const web3auth = new Web3Auth({
      clientId: WEB3AUTH_CLIENT_ID,
      web3AuthNetwork: 'testnet',
      chainConfig: {
        chainNamespace: 'eip155',
        chainId: '0x5', // Please use 0x5 for Goerli Testnet
        rpcTarget: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      },
      uiConfig: {
        theme: 'dark',
        loginMethodsOrder: ['google', 'facebook'],
      },
    })

    if (!getWeb3AuthStore() && !initializing) {
      initializing = true
      web3auth.initModal().then(() => {
        console.log('Initialized modal.')
        setWeb3AuthStore(web3auth)
        initializing = false
      })
    }
  })
}

// `connectWallet` is called when connecting/switching wallets and on pairing `connect` event (when prev. session connects)
// This re-entrant lock prevents multiple `connectWallet`/tracking calls that would otherwise occur for pairing module
let isConnecting = false

export const connectWallet = async (web3Auth: Web3Auth) => {
  if (isConnecting) {
    console.log('Already connecting')
    return
  }

  isConnecting = true
  try {
    await web3Auth.connect()
  } finally {
    isConnecting = false
  }
}

export default useWeb3AuthStore
