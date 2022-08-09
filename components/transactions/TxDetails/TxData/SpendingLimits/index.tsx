import React, { ReactElement, useMemo } from 'react'
import { Custom, TransactionData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import { TokenIcon } from '@/components/common/TokenAmount'
import SpeedIcon from '@mui/icons-material/Speed'
import { useCurrentChain } from '@/hooks/useChains'
import { selectTokens } from '@/store/balancesSlice'
import { useAppSelector } from '@/store'
import { sameAddress } from '@/utils/addresses'
import { formatDecimals } from '@/utils/formatters'
import { isSetAllowance, SpendingLimitMethods } from '@/utils/transaction-guards'
import css from './styles.module.css'

type SpendingLimitsProps = {
  txData?: TransactionData
  txInfo: Custom
  type: SpendingLimitMethods
}

export const SpendingLimits = ({ txData, txInfo, type }: SpendingLimitsProps): ReactElement | null => {
  const chain = useCurrentChain()
  const tokens = useAppSelector(selectTokens)
  const isSetAllowanceMethod = useMemo(() => isSetAllowance(type), [type])

  const [beneficiary, tokenAddress, amount, resetTimeMin] =
    txData?.dataDecoded?.parameters?.map(({ value }) => value) || []

  const resetTimeLabel = useMemo(
    () => getResetTimeOptions(chain?.chainName).find(({ value }) => +value === +resetTimeMin)?.label,
    [chain?.chainName, resetTimeMin],
  )
  const tokenInfo = useMemo(
    () => tokens.find(({ address }) => sameAddress(address, tokenAddress as string)),
    [tokenAddress, tokens],
  )
  const txTo = txInfo.to

  if (!txData) return null

  return (
    <Box className={css.container}>
      <Typography>
        <b>{`${isSetAllowanceMethod ? 'Modify' : 'Delete'} spending limit:`}</b>
      </Typography>
      <Box className={css.group}>
        <Typography sx={({ palette }) => ({ color: palette.secondary.light })}>Beneficiary</Typography>
        <EthHashInfo
          address={(beneficiary as string) || txTo?.value || '0x'}
          name={txTo.name}
          customAvatar={txTo.logoUri}
          shortAddress={false}
          showCopyButton
          hasExplorer
        />
      </Box>
      <Box className={css.group}>
        <Typography sx={({ palette }) => ({ color: palette.secondary.light })}>
          {isSetAllowanceMethod ? (tokenInfo ? 'Amount' : 'Raw Amount (in decimals)') : 'Token'}
        </Typography>
        <Box className={css.inline}>
          {tokenInfo && (
            <>
              <TokenIcon logoUri={tokenInfo.logoUri} size={32} tokenSymbol={tokenInfo.symbol} />
              <Typography>{tokenInfo.symbol}</Typography>
            </>
          )}

          {isSetAllowanceMethod && (
            <>
              {tokenInfo ? (
                <Typography>
                  {formatDecimals(amount as string, tokenInfo.decimals)} {tokenInfo.symbol}
                </Typography>
              ) : (
                <Typography>{amount}</Typography>
              )}
            </>
          )}
        </Box>
      </Box>
      {isSetAllowanceMethod && (
        <Box className={css.group}>
          <Typography sx={({ palette }) => ({ color: palette.secondary.light })}>Reset time</Typography>
          {resetTimeLabel ? (
            <Box className={css.inline}>
              <SpeedIcon sx={({ palette }) => ({ color: palette.border.main })} />
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
