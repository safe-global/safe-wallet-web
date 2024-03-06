import { Box, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import type { ChangeEvent, Dispatch, ReactElement, SetStateAction } from 'react'

import WalletIcon from '@/components/common/WalletIcon'
import useWallet from '@/hooks/wallets/useWallet'
import type { RelayResponse } from '@/services/tx/relaying'
import RemainingRelays from '../RemainingRelays'
import SponsoredBy from '../SponsoredBy'

import BalanceInfo from '@/components/tx/BalanceInfo'
import { useCurrentChain } from '@/hooks/useChains'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import madProps from '@/utils/mad-props'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'

export const enum ExecutionMethod {
  RELAY = 'RELAY',
  WALLET = 'WALLET',
}

const _ExecutionMethodSelector = ({
  wallet,
  chain,
  executionMethod,
  setExecutionMethod,
  relays,
  noLabel,
  tooltip,
}: {
  wallet: ConnectedWallet | null
  chain?: ChainInfo
  executionMethod: ExecutionMethod
  setExecutionMethod: Dispatch<SetStateAction<ExecutionMethod>>
  relays?: RelayResponse
  noLabel?: boolean
  tooltip?: string
}): ReactElement | null => {
  const shouldRelay = executionMethod === ExecutionMethod.RELAY

  const onChooseExecutionMethod = (_: ChangeEvent<HTMLInputElement>, newExecutionMethod: string) => {
    setExecutionMethod(newExecutionMethod as ExecutionMethod)
  }

  return (
    <Box data-sid="50254" className={css.container} sx={{ borderRadius: ({ shape }) => `${shape.borderRadius}px` }}>
      <div data-sid="43638" className={css.method}>
        <FormControl sx={{ display: 'flex' }}>
          {!noLabel ? (
            <Typography variant="body2" className={css.label}>
              Who will pay gas fees:
            </Typography>
          ) : null}

          <RadioGroup row value={executionMethod} onChange={onChooseExecutionMethod}>
            <FormControlLabel
              sx={{ flex: 1 }}
              value={ExecutionMethod.RELAY}
              label={
                <Typography className={css.radioLabel}>
                  Sponsored by
                  <SponsoredBy chainId={chain?.chainId ?? ''} />
                </Typography>
              }
              control={<Radio />}
            />

            <FormControlLabel
              data-testid="connected-wallet-execution-method"
              sx={{ flex: 1 }}
              value={ExecutionMethod.WALLET}
              label={
                <Typography className={css.radioLabel}>
                  <WalletIcon provider={wallet?.label || ''} width={20} height={20} icon={wallet?.icon} /> Connected
                  wallet
                </Typography>
              }
              control={<Radio />}
            />
          </RadioGroup>
        </FormControl>
      </div>

      {shouldRelay && relays ? <RemainingRelays relays={relays} tooltip={tooltip} /> : wallet ? <BalanceInfo /> : null}
    </Box>
  )
}

export const ExecutionMethodSelector = madProps(_ExecutionMethodSelector, {
  wallet: useWallet,
  chain: useCurrentChain,
})
