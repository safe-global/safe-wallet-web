import dynamic from 'next/dynamic'
import ExternalStore from '@/services/ExternalStore'

const WalletConnectUi = dynamic(() => import('./components/WalletConnectUi'))

export default WalletConnectUi

// Open/close WC popup externally
export const wcPopupStore = new ExternalStore<boolean>(false)

export function openWalletConnect() {
  wcPopupStore.setStore(true)
}

export { WC_URI_SEARCH_PARAM } from './constants'
