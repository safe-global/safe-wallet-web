import { useEffect } from 'react'
import ExternalStore from '@/services/ExternalStore'
import ThresholdKey from '@tkey-mpc/core'
import { TorusServiceProvider } from '@tkey-mpc/service-provider-torus'
import { TorusStorageLayer } from '@tkey-mpc/storage-layer-torus'
import { ShareSerializationModule } from '@tkey-mpc/share-serialization'
import { SecurityQuestionsModule } from '@tkey/security-questions'
import { WEB3_AUTH_CLIENT_ID } from '@/config/constants'

const { getStore, setStore, useStore } = new ExternalStore<ThresholdKey>()

export const useInitMPC = () => {
  const currentKey = useStore()

  useEffect(() => {
    // Configuration of Service Provider
    const torusSp = new TorusServiceProvider({
      useTSS: true,
      customAuthArgs: {
        network: 'sapphire_devnet',
        web3AuthClientId: WEB3_AUTH_CLIENT_ID,
        baseUrl: `${window.location.origin}/serviceworker`,
        enableLogging: true,
      },
    })

    // Configuration of Metadata Storage Layer
    const storageLayer = new TorusStorageLayer({
      hostUrl: 'https://sapphire-dev-2-1.authnetwork.dev/metadata',
      enableLogging: true,
    })

    // Configuration of Share Serialization Module
    const shareSerializationModule = new ShareSerializationModule()

    // Security questions module
    const securityQuestionsModule = new SecurityQuestionsModule()

    // Instantiation of tKey
    const tKey = new ThresholdKey({
      enableLogging: true,
      serviceProvider: torusSp,
      storageLayer: storageLayer,
      manualSync: true,
      modules: {
        shareSerialization: shareSerializationModule,
        securityQuestions: securityQuestionsModule,
      },
    })

    setStore(tKey)
  }, [])

  useEffect(() => {
    const init = async () => {
      if (!currentKey) {
        return
      }
      // Initialization of Service Provider
      try {
        await (currentKey.serviceProvider as TorusServiceProvider).init({})
      } catch (error) {
        console.error(error)
      }
    }
    init()
  }, [currentKey])
}

export default useStore
