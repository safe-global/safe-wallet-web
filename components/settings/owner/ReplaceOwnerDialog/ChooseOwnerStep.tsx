import { AddressInfo } from '@/components/common/AddressInfo'
import { AddressInput } from '@/components/common/AddressInput'
import useSafeInfo from '@/services/useSafeInfo'
import { uniqueAddress, addressIsNotCurrentSafe } from '@/services/validation'
import { DialogContent, TextField, DialogActions, Button } from '@mui/material'
import { useState, ChangeEvent } from 'react'

import css from './styles.module.css'

interface OwnerData {
  address: string
  name: string
}

export const ChooseOwnerStep = ({
  address,
  onOwnerChosen,
  handleClose,
  initialOwner,
}: {
  address: string
  onOwnerChosen: (owner: OwnerData) => void
  handleClose: () => void
  initialOwner?: OwnerData
}) => {
  const { safe } = useSafeInfo()
  const owners = safe?.owners

  const notAlreadyOwner = uniqueAddress(owners?.map((owner) => owner.value))
  const notCurrentSafe = addressIsNotCurrentSafe(safe?.address.value ?? '')

  const [ownerName, setOwnerName] = useState(initialOwner?.name ?? '')
  const [ownerAddress, setOwnerAddress] = useState(initialOwner?.address ?? '')

  const onNameChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setOwnerName(event.target.value)
  }

  const onSubmit = () => {
    onOwnerChosen({ address: ownerAddress, name: ownerName })
  }

  return (
    <>
      <DialogContent>
        <div className={css.content}>
          <p>
            Review the owner you want to replace from the active Safe. Then specify the new owner you want to replace it
            with:
          </p>
          <div>
            <span>Current owner</span>
            <AddressInfo address={address} copyToClipboard />
          </div>
          <div className={css.newOwner}>
            <span>New owner</span>
            <TextField
              autoFocus
              id="ownerName"
              label="Owner name"
              variant="outlined"
              value={ownerName}
              fullWidth
              onChange={onNameChange}
            />
            <AddressInput
              label="Owner address"
              name="ownerAddress"
              address={ownerAddress}
              onAddressChange={setOwnerAddress}
              validators={[notAlreadyOwner, notCurrentSafe]}
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions className={css.dialogFooter}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>
          Next
        </Button>
      </DialogActions>
    </>
  )
}
