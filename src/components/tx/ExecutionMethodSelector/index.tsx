import { Box, FormControl, FormControlLabel, SvgIcon, Radio, RadioGroup, Typography } from '@mui/material'
import type { Dispatch, SetStateAction, ReactElement, ChangeEvent } from 'react'

import useWallet from '@/hooks/wallets/useWallet'
import WalletIcon from '@/components/common/WalletIcon'
import RelayerIcon from '@/public/images/common/relayer.svg'
import SponsoredBy from '../SponsoredBy'
import type { RelayResponse } from '@/services/tx/relaying'

import css from './styles.module.css'

export const enum ExecutionMethod {
  RELAY = 'RELAY',
  WALLET = 'WALLET',
}

export const ExecutionMethodSelector = ({
  executionMethod,
  setExecutionMethod,
  relays,
  noLabel,
  tooltip,
}: {
  executionMethod: ExecutionMethod
  setExecutionMethod: Dispatch<SetStateAction<ExecutionMethod>>
  relays?: RelayResponse
  noLabel?: boolean
  tooltip?: string
}): ReactElement | null => {
  const wallet = useWallet()

  const shouldRelay = executionMethod === ExecutionMethod.RELAY

  const onChooseExecutionMethod = (_: ChangeEvent<HTMLInputElement>, newExecutionMethod: string) => {
    setExecutionMethod(newExecutionMethod as ExecutionMethod)
  }

  return (
    <Box className={css.container} sx={{ borderRadius: ({ shape }) => `${shape.borderRadius}px` }}>
      <Box className={css.method}>
        <FormControl sx={{ display: 'flex' }}>
          {!noLabel ? (
            <Typography variant="body2" className={css.label}>
              Choose execution method:
            </Typography>
          ) : null}
          <RadioGroup row value={executionMethod} onChange={onChooseExecutionMethod}>
            <FormControlLabel
              sx={{ flex: 1 }}
              value={ExecutionMethod.RELAY}
              label={
                <Typography className={css.radioLabel}>
                  <SvgIcon component={RelayerIcon} inheritViewBox fontSize="small" />
                  Relayer
                </Typography>
              }
              control={<Radio />}
            />
            <FormControlLabel
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
      </Box>

      {shouldRelay && relays ? <SponsoredBy relays={relays} tooltip={tooltip} /> : null}
    </Box>
  )
}
