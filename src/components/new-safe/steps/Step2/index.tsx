import { Button, TextField, Grid, SvgIcon, MenuItem, Select, Tooltip, Typography } from '@mui/material'
import { get, useFieldArray, useForm } from 'react-hook-form'
import { Fragment, useMemo, useState } from 'react'
import type { ReactElement } from 'react'

import { getRandomName } from '@/hooks/useMnemonicName'
import useWallet from '@/hooks/wallets/useWallet'
import AddIcon from '@/public/images/common/add.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import StepCard from '../../StepCard'

import css from './styles.module.css'

type Owner = {
  name: string
  address: string
}

type CreateSafeStep2Form = {
  owners: Owner[]
  mobileOwner: Owner
  threshold: number
}

enum CreateSafeStep2Fields {
  owners = 'owners',
  mobileOwner = 'mobileOwner',
  threshold = 'threshold',
}

const STEP_2_FORM_ID = 'create-safe-step-2-form'

const CreateSafeStep2 = (): ReactElement => {
  const wallet = useWallet()

  const [willAddMobileOwner, setWillAddMobileOwner] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateSafeStep2Form>({
    mode: 'all',
    defaultValues: {
      [CreateSafeStep2Fields.owners]: [{ name: '', address: wallet?.address || '' }],
      [CreateSafeStep2Fields.mobileOwner]: undefined,
      [CreateSafeStep2Fields.threshold]: 1,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'owners', shouldUnregister: true })

  const mobileOwnerFallbackName = useMemo(() => getRandomName(), [])

  const mobileOwnerNameError = get(errors, `${CreateSafeStep2Fields.mobileOwner}.name`)
  const mobileOwnerAddressError = get(errors, `${CreateSafeStep2Fields.mobileOwner}.address`)

  const onSubmit = (data: CreateSafeStep2Form) => {
    console.log(data)
  }

  return (
    <StepCard
      title="Owners and confirmations"
      subheader="Here you can add owners to your Safe and determine how many owners need to confirm before making a successful transaction"
      content={
        <form onSubmit={handleSubmit(onSubmit)} id={STEP_2_FORM_ID}>
          <Grid container spacing={3}>
            {fields.map((field, i) => {
              const fallbackName = getRandomName()

              const ownerFieldError = get(errors, `${CreateSafeStep2Fields.owners}.${i}.name`)
              const addressFieldError = get(errors, `${CreateSafeStep2Fields.owners}.${i}.address`)

              return (
                <Fragment key={field.id}>
                  <Grid item xs={5}>
                    <TextField
                      label={ownerFieldError?.message || 'Name'}
                      error={!!ownerFieldError}
                      placeholder={fallbackName}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      helperText={i === 0 ? 'Your wallet address' : undefined}
                      {...register(`${CreateSafeStep2Fields.owners}.${i}.name`)}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={6}>
                    {/* TODO: Use address input */}
                    <TextField
                      label={addressFieldError?.message || 'Address'}
                      error={!!addressFieldError}
                      required
                      {...register(`${CreateSafeStep2Fields.owners}.${i}.address`, { required: true })}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={1}>
                    {i !== 0 && <Button onClick={() => remove(i)}>Remove</Button>}
                  </Grid>
                </Fragment>
              )
            })}

            <Grid item xs={12}>
              <Button
                variant="text"
                startIcon={
                  <SvgIcon
                    component={AddIcon}
                    inheritViewBox
                    fontSize="small"
                    onClick={() => append({ name: '', address: '' }, { shouldFocus: true })}
                  />
                }
              >
                Add new owner
              </Button>
            </Grid>

            <Typography variant="h4" className={css.title}>
              Safe Mobile owner key (optional){' '}
              <Tooltip title="TODO: Add tooltip" arrow placement="top">
                <span>
                  <SvgIcon component={InfoIcon} inheritViewBox />
                </span>
              </Tooltip>
            </Typography>
            <Typography variant="body2">
              Add an extra layer of security and sign transactions with the Safe Mobile app.
            </Typography>

            <Grid item xs={12}>
              {!willAddMobileOwner ? (
                <Button
                  variant="text"
                  startIcon={
                    <SvgIcon
                      component={AddIcon}
                      inheritViewBox
                      fontSize="small"
                      onClick={() => setWillAddMobileOwner(true)}
                    />
                  }
                >
                  Add new owner
                </Button>
              ) : (
                <>
                  <Grid item xs={5}>
                    <TextField
                      label={mobileOwnerNameError?.message || 'Name'}
                      error={!!mobileOwnerNameError}
                      placeholder={mobileOwnerFallbackName}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      {...register(`${CreateSafeStep2Fields.mobileOwner}.name`)}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={6}>
                    {/* TODO: Use address input */}
                    <TextField
                      label={mobileOwnerAddressError?.message || 'Address'}
                      error={!!mobileOwnerAddressError}
                      required
                      {...register(`${CreateSafeStep2Fields.mobileOwner}.address`, { required: true })}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={1}>
                    <Button onClick={() => setWillAddMobileOwner(false)}>Remove</Button>
                  </Grid>
                </>
              )}
              <Typography variant="h4" className={css.title}>
                Threshold{' '}
                <Tooltip title="TODO: Add tooltip" arrow placement="top">
                  <span>
                    <SvgIcon component={InfoIcon} inheritViewBox />
                  </span>
                </Tooltip>
              </Typography>

              <Typography variant="body2">Any transaction requires the confirmation of:</Typography>
              <Grid item xs={12}>
                <Select {...register(CreateSafeStep2Fields.threshold)} defaultValue={fields.length}>
                  {fields.map((_, i) => (
                    <MenuItem key={i} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>{' '}
                out of {fields.length} owner(s).
              </Grid>
            </Grid>
          </Grid>
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
