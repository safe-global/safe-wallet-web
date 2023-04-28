import classNames from 'classnames'
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
}: {
  executionMethod: ExecutionMethod
  setExecutionMethod: Dispatch<SetStateAction<ExecutionMethod>>
  relays?: RelayResponse
}): ReactElement | null => {
  const wallet = useWallet()

  const shouldRelay = executionMethod === ExecutionMethod.RELAY

  const onChooseExecutionMethod = (_: ChangeEvent<HTMLInputElement>, newExecutionMethod: string) => {
    setExecutionMethod(newExecutionMethod as ExecutionMethod)
  }

  return (
    <Box className={classNames(css.noTopBorderRadius, { [css.noBorderRadius]: shouldRelay })}>
      <Box className={css.container} sx={{ borderRadius: ({ shape }) => `${shape.borderRadius}px` }}>
        <FormControl sx={{ display: 'flex' }}>
          <Typography variant="body2" sx={{ color: ({ palette }) => palette.text.secondary }}>
            Choose execution method
          </Typography>
          <RadioGroup row value={executionMethod} onChange={onChooseExecutionMethod}>
            <FormControlLabel
              sx={{ flex: 1 }}
              value={ExecutionMethod.RELAY}
              label={
                <Typography className={css.label}>
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
                <Typography className={css.label}>
                  <WalletIcon provider={wallet?.label || ''} width={20} height={20} /> Connected wallet
                </Typography>
              }
              control={<Radio />}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {shouldRelay && relays ? (
        <Box className={css.noTopBorderRadius}>
          <SponsoredBy relays={relays} />
        </Box>
      ) : null}
    </Box>
  )
}
