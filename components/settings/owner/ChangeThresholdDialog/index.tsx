import { Button, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import TxModal from '@/components/tx/TxModal'
import { TxStepperProps } from '@/components/tx/TxStepper'
import useSafeInfo from '@/services/useSafeInfo'

import { showNotification } from '@/store/notificationsSlice'
import { CodedException, Errors } from '@/services/exceptions'
import { useDispatch } from 'react-redux'
import { getSafeSDK } from '@/services/safe-core/safeCoreSDK'
import { createTx, dispatchTxProposal, dispatchTxSigning } from '@/services/tx/txSender'
import useWallet from '@/services/wallets/useWallet'
import { ReviewTxForm, ReviewTxFormData } from '@/components/tx/ReviewTxForm'
import useAsync from '@/services/useAsync'

import css from './styles.module.css'

interface ChangeThresholdData {
  threshold: number
}

const ChangeThresholdSteps: TxStepperProps['steps'] = [
  {
    label: 'Change Threshold',
    render: (data, onSubmit, onClose) => <ChangeThresholdStep data={data as ChangeThresholdData} onClose={onClose} />,
  },
]

export const ChangeThresholdDialog = () => {
  const [open, setOpen] = useState(false)

  const { safe } = useSafeInfo()

  const handleClose = () => setOpen(false)

  const initialModalData: ChangeThresholdData = { threshold: safe?.threshold || 1 }

  return (
    <div>
      <div>
        <Button onClick={() => setOpen(true)} variant="contained">
          Change
        </Button>
      </div>
      {open && <TxModal onClose={handleClose} steps={ChangeThresholdSteps} initialData={[initialModalData]} />}
    </div>
  )
}

const ChangeThresholdStep = ({ data, onClose }: { data: ChangeThresholdData; onClose: () => void }) => {
  const { safe } = useSafeInfo()
  const connectedWallet = useWallet()
  const dispatch = useDispatch()
  const sdk = getSafeSDK()

  const [options, setOptions] = useState<number[]>([0])
  const [selectedThreshold, setSelectedThreshold] = useState<number>(data.threshold ?? 1)
  useEffect(() => {
    setOptions(Array.from(Array(safe?.owners.length ?? 0).keys()))
  }, [safe])

  const [tx, error, loading] = useAsync(() => sdk.getChangeThresholdTx(selectedThreshold), [sdk, selectedThreshold])

  const handleChange = (event: SelectChangeEvent<number>) => {
    setSelectedThreshold(parseInt(event.target.value.toString()))
  }

  const onSubmitHandler = async (data: ReviewTxFormData) => {
    if (safe && connectedWallet && tx) {
      try {
        const editedTx = { ...tx.data, nonce: data.nonce, safeTxGas: data.safeTxGas }
        const createdTx = await createTx(editedTx)
        const signedTx = await dispatchTxSigning(createdTx)
        await dispatchTxProposal(safe.chainId, safe.address.value, connectedWallet.address, signedTx)
        onClose()
      } catch (err) {
        const { message } = new CodedException(Errors._804, (err as Error).message)
        dispatch(showNotification({ message }))
      }
    }
  }
  return (
    <div className={css.container}>
      <Typography>Any transaction requires the confirmation of:</Typography>
      <span>
        <Select value={selectedThreshold} onChange={handleChange}>
          {options.map((option) => (
            <MenuItem key={option + 1} value={option + 1}>
              {option + 1}
            </MenuItem>
          ))}
        </Select>{' '}
        <Typography>out of {safe?.owners.length ?? 0} owner(s)</Typography>
      </span>
      <ReviewTxForm onFormSubmit={onSubmitHandler} txParams={tx?.data} />
    </div>
  )
}
