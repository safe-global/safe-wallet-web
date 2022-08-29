import { ReactElement } from 'react'
import { BaseTransaction, RequestId, SendTransactionRequestParams } from '@gnosis.pm/safe-apps-sdk'
import { DecodedDataParameterValue, DecodedDataResponse, SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import ModalDialog from '@/components/common/ModalDialog'
import { validateAddress } from '@/utils/validation'
import { Button, DialogActions, DialogContent } from '@mui/material'
import SendFromBlock from '@/components/tx/SendFromBlock'
import { Box } from '@mui/system'

export type ConfirmTxModalProps = {
  isOpen: boolean
  app?: SafeAppData
  txs: BaseTransaction[]
  params?: SendTransactionRequestParams
  safeAddress: string
  requestId: RequestId
  ethBalance: string
  onUserConfirm: (safeTxHash: string, requestId: RequestId) => void
  onTxReject: (requestId: RequestId) => void
  onClose: () => void
  appId?: string
}

const isTxValid = (t: BaseTransaction): boolean => {
  if (!['string', 'number'].includes(typeof t.value)) {
    return false
  }

  if (typeof t.value === 'string' && !/^(0x)?[0-9a-f]+$/i.test(t.value)) {
    return false
  }

  const isAddressValid = validateAddress(t.to) === undefined
  return isAddressValid && !!t.data && typeof t.data === 'string'
}

export type DecodedTxDetailType = DecodedDataParameterValue | DecodedDataResponse | undefined

export const ConfirmTxModal = ({
  app,
  onClose,
  onTxReject,
  txs,
  requestId,
  isOpen,
}: ConfirmTxModalProps): ReactElement => {
  const invalidTransactions = !txs.length || txs.some((t) => !isTxValid(t))

  const rejectTransaction = () => {
    onClose()
    onTxReject(requestId)
  }

  return (
    <ModalDialog dialogTitle={app?.name} open={isOpen} onClose={rejectTransaction}>
      <DialogContent>
        {invalidTransactions ? (
          <p>Error</p>
        ) : (
          // <SafeAppLoadError  />
          <Box py={2}>
            <SendFromBlock />
          </Box>
        )}
      </DialogContent>
      <DialogActions disableSpacing>
        <Button color="inherit" onClick={rejectTransaction}>
          Back
        </Button>
        <Button variant="contained" onClick={() => {}}>
          Submit
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}
