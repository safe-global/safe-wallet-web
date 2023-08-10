import { type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'

const ReadableDescription = ({ txData }: { txData?: TransactionData }) => {
  // @ts-ignore TODO: Update gateway-sdk
  if (!txData?.readableDescription) return null

  // @ts-ignore TODO: Update gateway-sdk
  return <div className={css.wrapper}>{txData.readableDescription}</div>
}

export default ReadableDescription
