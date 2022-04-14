import { ReactElement } from 'react'
import {SafeTransactionDataPartial} from "@gnosis.pm/safe-core-sdk-types";

import useSafeAddress from 'services/useSafeAddress'
import { useAppSelector } from 'store'
import { selectChainById } from 'store/chainsSlice'
import { selectSafeInfo } from 'store/safeInfoSlice'
import SafeHeader from '../SafeHeader'
import SafeList from '../SafeList'
import css from './styles.module.css'
import {getSafeSDK} from "utils/web3";

const Sidebar = (): ReactElement => {
  const { loading, error } = useAppSelector(selectSafeInfo)
  const { address, chainId } = useSafeAddress()
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))

  const handleCreateTransaction = async () => {
    const safeSdk = getSafeSDK()
    // TODO: Get these values from a form
    const nonce = await safeSdk.getNonce()
    const transaction: SafeTransactionDataPartial = {
      nonce,
      to: address,
      value: "1",
      data: '0x'
    }

    const safeTransaction = await safeSdk.createTransaction(transaction)
    const executeTxResponse = await safeSdk.executeTransaction(safeTransaction)
    await executeTxResponse.transactionResponse?.wait()
  }

  return (
    <div className={css.container}>
      <div
        className={css.chain}
        style={{ backgroundColor: chainConfig?.theme.backgroundColor, color: chainConfig?.theme.textColor }}
      >
        {chainConfig?.chainName || ' '}
      </div>

      {!error && <SafeHeader />}

      {!error && <SafeList />}

      {loading ? 'Loading Safe info...' : error ? 'Error loading Safe' : ''}
      <button onClick={handleCreateTransaction}>Create Transaction</button>
    </div>
  )
}

export default Sidebar
