import { AddressInfo } from '@/components/common/AddressInfo'
import { AddressInput } from '@/components/common/AddressInput'
import ChainIndicator from '@/components/common/ChainIndicator'
import useSafeInfo from '@/services/useSafeInfo'
import { addressIsNotCurrentSafe, uniqueAddress, validateAddress } from '@/services/validation'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, TextField } from '@mui/material'
import { stringify } from 'querystring'
import { ChangeEvent, useState } from 'react'
import { SubmitOwnerTxStep } from './SubmitOwnerTxStep'
import { ChooseOwnerStep } from './ChooseOwnerStep'
import css from './styles.module.css'

export const ReplaceOwnerDialog = ({ address, chainId }: { address: string; chainId: string }) => {
  const [open, setOpen] = useState(false)

  const [newOwner, setNewOwner] = useState<{ address: string; name: string } | undefined>(undefined)

  const [step, setStep] = useState<1 | 2>(1)
  const dispatch = useAppDispatch()

  const handleClose = () => setOpen(false)

  const goBack = () => setStep(1)

  const ownerChosen = (owner: { address: string; name: string }) => {
    if (!validateAddress(owner.address) && owner.name) {
      setNewOwner(owner)
      setStep(2)
    }
  }

  return (
    <div>
      <Button variant="text" onClick={() => setOpen(true)}>
        Replace
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className={css.title}>
          <div>
            Replace owner <span className={css.light}>Step {step} of 2</span>
          </div>
          <ChainIndicator />
        </DialogTitle>
        {step === 1 && (
          <ChooseOwnerStep
            address={address}
            handleClose={handleClose}
            onOwnerChosen={ownerChosen}
            initialOwner={newOwner}
          />
        )}
        {step === 2 && <SubmitOwnerTxStep onBack={goBack} />}
      </Dialog>
    </div>
  )
}
