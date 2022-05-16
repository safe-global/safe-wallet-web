import { AddressInfo } from '@/components/common/AddressInfo'
import { AddressInput } from '@/components/common/AddressInput'
import useSafeInfo from '@/services/useSafeInfo'
import { uniqueAddress, addressIsNotCurrentSafe } from '@/services/validation'
import { TextField, Button } from '@mui/material'
import { useState, ChangeEvent } from 'react'

import css from './styles.module.css'

export interface ReplaceOwnerData {
  removedOwner: OwnerData
  newOwner: OwnerData
}
export interface OwnerData {
  address: string
  name?: string
}

export const ChooseOwnerStep = ({
  data,
  onOwnerChosen,
}: {
  data: ReplaceOwnerData
  onOwnerChosen: (data: ReplaceOwnerData) => void
}) => {
  const { safe } = useSafeInfo()
  const { address } = data.removedOwner
  const owners = safe?.owners

  const notAlreadyOwner = uniqueAddress(owners?.map((owner) => owner.value))
  const notCurrentSafe = addressIsNotCurrentSafe(safe?.address.value ?? '')

  const [ownerName, setOwnerName] = useState(data.newOwner.name ?? '')
  const [ownerAddress, setOwnerAddress] = useState(data.newOwner.address ?? '')

  const onNameChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setOwnerName(event.target.value)
  }

  const onSubmit = () => {
    onOwnerChosen({ ...data, newOwner: { address: ownerAddress, name: ownerName } })
  }

  return (
    <div className={css.container}>
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
      <div className={css.submit}>
        <Button variant="contained" onClick={onSubmit}>
          Next
        </Button>
      </div>
    </div>
  )
}
