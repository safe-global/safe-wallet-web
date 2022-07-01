import React from 'react'
import { Custom, TransactionData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box, Typography } from '@mui/material'
import { AddressInfo } from '@/components/transactions/TxDetails/TxData'
import css from '../styles.module.css'
import { selectTokens } from '@/store/balancesSlice'
import { useAppSelector } from '@/store'
import { sameAddress } from '@/utils/addresses'

type DeleteAllowanceProps = {
  txData: TransactionData
  txInfo: Custom
}

export const DeleteAllowance = ({ txData, txInfo }: DeleteAllowanceProps) => {
  const tokens = useAppSelector(selectTokens)

  const [beneficiary, tokenAddress] = txData.dataDecoded?.parameters?.map(({ value }) => value) || []

  const tokenInfo = tokens.find(({ address }) => sameAddress(address, tokenAddress as string))
  const txTo = txInfo.to

  return (
    <Box className={css.container}>
      <Typography>
        <b>Delete spending limit:</b>
      </Typography>
      <Box className={css.group}>
        <Typography sx={({ palette }) => ({ color: palette.black[400] })}>Beneficiary</Typography>
        <AddressInfo
          address={(beneficiary as string) || txTo?.value || '0x'}
          name={txTo.name || undefined}
          avatarUrl={txTo.logoUri || undefined}
        />
      </Box>
      {tokenInfo && (
        <Box className={css.group}>
          <Typography sx={({ palette }) => ({ color: palette.black[400] })}>Token</Typography>
          <Box className={css.inline}>
            <img src={tokenInfo.logoUri || ''} width={32} height={32} alt={`${tokenInfo.name} logo`} />
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default DeleteAllowance
