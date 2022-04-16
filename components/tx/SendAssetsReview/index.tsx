import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Button, Typography } from '@mui/material'
import { TokenIcon } from 'components/common/TokenAmount'
import { type ReactElement } from 'react'
import { createTokenTransferParams, createTransaction } from 'services/createTransaction'
import { shortenAddress } from 'services/formatters'
import { useAppSelector } from 'store'
import { selectBalances } from 'store/balancesSlice'
import { SendAssetsFormData } from '../SendAssetsForm'
import css from './styles.module.css'

const SendAssetsReview = ({
  params,
  onSubmit,
}: {
  params: SendAssetsFormData
  onSubmit: (tx: SafeTransaction) => void
}): ReactElement => {
  const balances = useAppSelector(selectBalances)
  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)

  const txParams = token
    ? createTokenTransferParams(params.recepient, params.amount, token.tokenInfo.decimals, token.tokenInfo.address)
    : undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!txParams) return

    const editedTxParams = {
      ...txParams,
      nonce: 0, // @TODO: get recommended nonce
      baseGas: txParams.baseGas, // @TODO: estimate gas
    }

    const tx = await createTransaction(editedTxParams)

    onSubmit(tx)
  }

  return (
    <form className={css.container} onSubmit={handleSubmit}>
      <Typography variant="h6">Review transaction</Typography>

      <p>
        Send <TokenIcon logoUri={token?.tokenInfo.logoUri} tokenSymbol={token?.tokenInfo.symbol} />
        {params.amount}
        {token?.tokenInfo.symbol}
        {' to '}
        {shortenAddress(params.recepient)}
      </p>

      <div className={css.submit}>
        <Button variant="contained" type="submit">
          Create transaction
        </Button>
      </div>
    </form>
  )
}

export default SendAssetsReview
