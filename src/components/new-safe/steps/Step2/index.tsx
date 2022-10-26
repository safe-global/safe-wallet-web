import { Button, Grid, SvgIcon, MenuItem, Select, Tooltip, Typography, Divider } from '@mui/material'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import type { ReactElement } from 'react'

import useWallet from '@/hooks/wallets/useWallet'
import AddIcon from '@/public/images/common/add.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import StepCard from '../../StepCard'
import { OwnerRow } from './OwnerRow'
import useAddressBook from '@/hooks/useAddressBook'
import type { NamedAddress } from '@/components/create-safe/types'

type Owner = {
  name: string
  address: string
}

type CreateSafeStep2Form = {
  owners: Owner[]
  mobileOwners: Owner[]
  threshold: number
}

enum CreateSafeStep2Fields {
  owners = 'owners',
  mobileOwners = 'mobileOwners',
  threshold = 'threshold',
}

const STEP_2_FORM_ID = 'create-safe-step-2-form'

const CreateSafeStep2 = (): ReactElement => {
  const wallet = useWallet()
  const addressBook = useAddressBook()

  const defaultOwnerAddressBookName = wallet?.address ? addressBook[wallet.address] : undefined

  const defaultOwner: NamedAddress = {
    name: defaultOwnerAddressBookName || wallet?.ens || '',
    address: wallet?.address || '',
  }
  const formMethods = useForm<CreateSafeStep2Form>({
    mode: 'all',
    defaultValues: {
      [CreateSafeStep2Fields.owners]: [defaultOwner],
      [CreateSafeStep2Fields.mobileOwners]: [],
      [CreateSafeStep2Fields.threshold]: 1,
    },
  })

  const { register, handleSubmit, control } = formMethods

  const {
    fields: ownerFields,
    append: appendOwner,
    remove: removeOwner,
  } = useFieldArray({ control, name: 'owners', shouldUnregister: true })

  const {
    fields: mobileOwnerFields,
    append: appendMobileOwner,
    remove: removeMobileOwner,
  } = useFieldArray({ control, name: 'mobileOwners', shouldUnregister: true })

  const allOwners = [...ownerFields, ...mobileOwnerFields]

  const onSubmit = (data: CreateSafeStep2Form) => {
    console.log(data)
  }

  return (
    <StepCard
      title="Owners and confirmations"
      subheader="Here you can add owners to your Safe and determine how many owners need to confirm before making a successful transaction"
      content={
        <form onSubmit={handleSubmit(onSubmit)} id={STEP_2_FORM_ID}>
          <FormProvider {...formMethods}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {ownerFields.map((field, i) => (
                  <OwnerRow
                    key={field.id}
                    index={i}
                    removable={i > 0}
                    groupName={CreateSafeStep2Fields.owners}
                    remove={removeOwner}
                  />
                ))}
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="text"
                  onClick={() => appendOwner({ name: '', address: '' }, { shouldFocus: true })}
                  startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                >
                  Add new owner
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={700} display="inline-flex" alignItems="center" gap={1}>
                  Safe Mobile owner key (optional){' '}
                  <Tooltip title="TODO: Add tooltip" arrow placement="top">
                    <span>
                      <SvgIcon component={InfoIcon} inheritViewBox fontSize="small" />
                    </span>
                  </Tooltip>
                </Typography>
                <Typography variant="body2">
                  Add an extra layer of security and sign transactions with the Safe Mobile app.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                {mobileOwnerFields.map((field, i) => (
                  <OwnerRow
                    key={field.id}
                    groupName={CreateSafeStep2Fields.mobileOwners}
                    index={i}
                    remove={removeMobileOwner}
                  />
                ))}
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="text"
                  onClick={() => appendMobileOwner({ name: '', address: '' }, { shouldFocus: true })}
                  startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                >
                  Add mobile owner
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ ml: '-52px', mr: '-52px', mb: 4, mt: 3 }} />

                <Typography variant="h4" fontWeight={700} display="inline-flex" alignItems="center" gap={1}>
                  Threshold
                  <Tooltip title="TODO: Add tooltip" arrow placement="top">
                    <span>
                      <SvgIcon component={InfoIcon} inheritViewBox fontSize="small" />
                    </span>
                  </Tooltip>
                </Typography>
                <Typography variant="body2" mb={2}>
                  Any transaction requires the confirmation of:
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Select {...register(CreateSafeStep2Fields.threshold)} defaultValue={allOwners.length}>
                  {allOwners.map((_, i) => (
                    <MenuItem key={i} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>{' '}
                out of {allOwners.length} owner(s).
              </Grid>
            </Grid>
          </FormProvider>
        </form>
      }
      actions={
        <>
          <Button variant="contained" form={STEP_2_FORM_ID} type="submit">
            Continue
          </Button>
          <Button variant="text">Cancel</Button>
        </>
      }
    />
  )
}

export default CreateSafeStep2
