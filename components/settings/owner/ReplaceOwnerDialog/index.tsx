import ChainIndicator from '@/components/common/ChainIndicator'
import { validateAddress } from '@/services/validation'
import { Dialog, DialogTitle, IconButton, Tooltip } from '@mui/material'
import { useState } from 'react'
import { SubmitOwnerTxStep } from './SubmitOwnerTxStep'
import { ChooseOwnerStep } from './ChooseOwnerStep'
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined'

import css from './styles.module.css'

export const ReplaceOwnerDialog = ({ address, chainId }: { address: string; chainId: string }) => {
  const [open, setOpen] = useState(false)

  const [newOwner, setNewOwner] = useState<{ address: string; name: string } | undefined>(undefined)

  const [step, setStep] = useState<1 | 2>(1)

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
      <Tooltip title="Replace owner">
        <IconButton onClick={() => setOpen(true)}>
          <ChangeCircleOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} maxWidth={'lg'}>
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
        {step === 2 && newOwner && (
          <SubmitOwnerTxStep newOwner={{ ...newOwner }} removeOwner={{ address }} onBack={goBack} />
        )}
      </Dialog>
    </div>
  )
}
