import { AddressInfo } from '@/components/common/AddressInfo'
import { AddressInput } from '@/components/common/AddressInput'
import { ChangeOwnerData } from '@/components/settings/owner/DialogSteps/data'
import useSafeInfo from '@/services/useSafeInfo'
import { uniqueAddress, addressIsNotCurrentSafe } from '@/services/validation'
import { TextField, Button } from '@mui/material'
import { useState, ChangeEvent } from 'react'

import css from './styles.module.css'

export const ChooseOwnerStep = ({
  data,
  onSubmit,
}: {
  data: ChangeOwnerData
  onSubmit: (data: ChangeOwnerData) => void
}) => {
  const { safe } = useSafeInfo()
  const { removedOwner, newOwner } = data
  const owners = safe?.owners

  const isReplace = Boolean(removedOwner)

  const notAlreadyOwner = uniqueAddress(owners?.map((owner) => owner.value))
  const notCurrentSafe = addressIsNotCurrentSafe(safe?.address.value ?? '')

  const [ownerName, setOwnerName] = useState(newOwner.name ?? '')
  const [ownerAddress, setOwnerAddress] = useState(newOwner.address ?? '')

  const onNameChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setOwnerName(event.target.value)
  }

  const onSubmitHandler = () => {
    onSubmit({ ...data, newOwner: { address: ownerAddress, name: ownerName } })
  }

  return (
    <div className={css.container}>
      <p>
        {isReplace
          ? 'Review the owner you want to replace from the active Safe. Then specify the new owner you want to replace it with:'
          : 'Add a new owner to the active Safe.'}
      </p>
      {removedOwner && (
        <div>
          <span>Current owner</span>
          <AddressInfo address={removedOwner.address} copyToClipboard />
        </div>
      )}
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
        <Button variant="contained" onClick={onSubmitHandler}>
          Next
        </Button>
      </div>
    </div>
  )
}
