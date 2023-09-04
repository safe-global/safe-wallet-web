import { type ReactElement, useContext } from 'react'
import Button from '@mui/material/Button'
import css from './styles.module.css'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import CheckWallet from '@/components/common/CheckWallet'
import { TxModalContext } from '@/components/tx-flow'
import NewTxMenu from '@/components/tx-flow/flows/NewTx'

const NewTxButton = (): ReactElement => {
  const { setTxFlow } = useContext(TxModalContext)

  const onClick = () => {
    setTxFlow(<NewTxMenu />, undefined, false)
    trackEvent(OVERVIEW_EVENTS.NEW_TRANSACTION)
  }

  return (
    <CheckWallet allowSpendingLimit>
      {(isOk) => (
        <Button
          onClick={onClick}
          variant="contained"
          size="small"
          disabled={!isOk}
          fullWidth
          className={css.button}
          disableElevation
        >
          New transaction
        </Button>
      )}
    </CheckWallet>
  )
}

export default NewTxButton
