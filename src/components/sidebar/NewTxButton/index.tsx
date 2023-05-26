import { type ReactElement, useContext } from 'react'
import Button from '@mui/material/Button'
import css from './styles.module.css'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import CheckWallet from '@/components/common/CheckWallet'
import { ModalContext, ModalType } from '@/components/TxFlow/ModalProvider'

const NewTxButton = (): ReactElement => {
  const { setVisibleModal } = useContext(ModalContext)

  const onClick = () => {
    setVisibleModal({ type: ModalType.NewTx, props: {} })

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
