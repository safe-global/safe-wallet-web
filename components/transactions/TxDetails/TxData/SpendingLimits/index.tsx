import React, { useMemo } from 'react'
import { Custom, TransactionData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box, Typography } from '@mui/material'
import { AddressInfo } from '@/components/transactions/TxDetails/TxData'
import SpeedIcon from '@mui/icons-material/Speed'
import { useCurrentChain } from '@/hooks/useChains'
import { selectTokens } from '@/store/balancesSlice'
import { useAppSelector } from '@/store'
import { sameAddress } from '@/utils/addresses'
import { formatDecimals } from '@/utils/formatters'
import { isSetAllowance, SpendingLimitMethods } from '@/utils/transaction-guards'
import css from './styles.module.css'

type SpendingLimitsProps = {
  txData: TransactionData
  txInfo: Custom
  type: SpendingLimitMethods
}

export const SpendingLimits = ({ txData, txInfo, type }: SpendingLimitsProps) => {
  const chain = useCurrentChain()
  const tokens = useAppSelector(selectTokens)
  const isAllowance = useMemo(() => isSetAllowance(type), [type])

  const [beneficiary, tokenAddress, amount, resetTimeMin] =
    txData.dataDecoded?.parameters?.map(({ value }) => value) || []

  const resetTimeLabel = useMemo(
    () => getResetTimeOptions(chain?.chainName).find(({ value }) => +value === +resetTimeMin)?.label,
    [chain?.chainName, resetTimeMin],
  )
  const tokenInfo = useMemo(
    () => tokens.find(({ address }) => sameAddress(address, tokenAddress as string)),
    [tokenAddress, tokens],
  )
  const txTo = txInfo.to

  return (
    <Box className={css.container}>
      <Typography>
        <b>{`${isAllowance ? 'Modify' : 'Delete'} spending limit:`}</b>
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
          <Typography sx={({ palette }) => ({ color: palette.black[400] })}>
            {isAllowance ? 'Amount' : 'Token'}
          </Typography>
          <Box className={css.inline}>
            <img src={tokenInfo.logoUri || ''} width={32} height={32} alt={`${tokenInfo.name} logo`} />
            {isAllowance ? (
              <Typography>
                {formatDecimals(amount as string, tokenInfo.decimals || undefined)} {tokenInfo.symbol}
              </Typography>
            ) : (
              <></>
            )}
          </Box>
        </Box>
      )}
      {isAllowance && (
        <Box className={css.group}>
          <Typography sx={({ palette }) => ({ color: palette.black[400] })}>Reset time</Typography>
          {resetTimeLabel ? (
            <Box className={css.inline}>
              <SpeedIcon sx={({ palette }) => ({ color: palette.secondaryBlack[300] })} />
              <Typography variant="body2">{resetTimeLabel}</Typography>
            </Box>
          ) : (
            <Typography variant="body2">One-time spending limit</Typography>
          )}
        </Box>
      )}
    </Box>
  )
}

const RESET_TIME_OPTIONS = [
  { label: '1 day', value: '1440' },
  { label: '1 week', value: '10080' },
  { label: '1 month', value: '43200' },
]

const RINKEBY_RESET_TIME_OPTIONS = [
  { label: '5 minutes', value: '5' },
  { label: '30 minutes', value: '30' },
  { label: '1 hour', value: '60' },
]

const getResetTimeOptions = (chainName = ''): { label: string; value: string }[] => {
  const currentNetwork = chainName.toLowerCase()
  return currentNetwork !== 'rinkeby' ? RESET_TIME_OPTIONS : RINKEBY_RESET_TIME_OPTIONS
}

export default SpendingLimits
