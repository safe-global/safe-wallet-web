import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import classnames from 'classnames'
import { useCurrentChain } from '@/hooks/useChains'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import {
  FormControl,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'

import css from './styles.module.css'

export const enum PayMethod {
  PayNow = 'PayNow',
  PayLater = 'PayLater',
}

const PayNowPayLater = ({
  totalFee,
  canRelay,
  payMethod,
  setPayMethod,
}: {
  totalFee: string
  canRelay: boolean
  payMethod: PayMethod
  setPayMethod: Dispatch<SetStateAction<PayMethod>>
}) => {
  const chain = useCurrentChain()

  const onChoosePayMethod = (_: ChangeEvent<HTMLInputElement>, newPayMethod: string) => {
    setPayMethod(newPayMethod as PayMethod)
  }

  return (
    <>
      <Typography variant="h4" fontWeight="bold">
        Before you continue
      </Typography>
      <List>
        <ListItem disableGutters>
          <ListItemIcon className={css.listItem}>
            <CheckRoundedIcon fontSize="small" color="inherit" />
          </ListItemIcon>
          <Typography variant="body2">
            There will be a one-time network fee to activate your smart account wallet.
          </Typography>
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon className={css.listItem}>
            <CheckRoundedIcon fontSize="small" color="inherit" />
          </ListItemIcon>
          <Typography variant="body2">
            If you choose to pay later, the fee will be included with the first transaction you make.
          </Typography>
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon className={css.listItem}>
            <CheckRoundedIcon fontSize="small" color="inherit" />
          </ListItemIcon>
          <Typography variant="body2">Safe doesn&apos;t profit from the fees.</Typography>
        </ListItem>
      </List>
      <FormControl fullWidth>
        <RadioGroup row value={payMethod} onChange={onChoosePayMethod} className={css.radioGroup}>
          <FormControlLabel
            sx={{ flex: 1 }}
            value={PayMethod.PayNow}
            className={classnames(css.radioContainer, { [css.active]: payMethod === PayMethod.PayNow })}
            label={
              <>
                <Typography className={css.radioTitle}>Pay now</Typography>
                <Typography className={css.radioSubtitle} variant="body2" color="text.secondary">
                  {canRelay ? (
                    'Sponsored free transaction'
                  ) : (
                    <>
                      &asymp; {totalFee} {chain?.nativeCurrency.symbol}
                    </>
                  )}
                </Typography>
              </>
            }
            control={<Radio />}
          />

          <FormControlLabel
            data-testid="connected-wallet-execution-method"
            sx={{ flex: 1 }}
            value={PayMethod.PayLater}
            className={classnames(css.radioContainer, { [css.active]: payMethod === PayMethod.PayLater })}
            label={
              <>
                <Typography className={css.radioTitle}>Pay later</Typography>
                <Typography className={css.radioSubtitle} variant="body2" color="text.secondary">
                  with the first transaction
                </Typography>
              </>
            }
            control={<Radio />}
          />
        </RadioGroup>
      </FormControl>
    </>
  )
}

export default PayNowPayLater
