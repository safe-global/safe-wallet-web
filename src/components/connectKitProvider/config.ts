import { Ethereum, chains, type ChainInfo } from '@particle-network/chains'
import { evmWallets, type ConnectConfig } from '@particle-network/connectors'

const options: ConnectConfig = {
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
  clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY as string,
  appId: process.env.NEXT_PUBLIC_APP_ID as string,
  customStyle: {
    logo: '/favicon.ico',
    projectName: 'Particle - Safe Wallet WEB',
  },
  chains: [chains.getEVMChainInfoById(11155111) as ChainInfo, Ethereum],
  wallet: {
    //optional: particle wallet config
    visible: true, //display wallet button when connect particle success.
  },
  promptSettingConfig: {
    //optional: particle security account config
    //prompt set payment password. 0: None, 1: Once(default), 2: Always
    promptPaymentPasswordSettingWhenSign: 0,
    //prompt set master password. 0: None(default), 1: Once, 2: Always
    promptMasterPasswordSettingWhenLogin: 0,
  },
  connectors: evmWallets({
    projectId: '21d2a01621c47fb5f34b06c6390ac0bb', //replace with walletconnect projectId
    showQrModal: false,
  }),
}

export { options }
