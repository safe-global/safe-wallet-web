import { useState } from 'react'
import { EthHashInfo } from '@safe-global/safe-react-components'
import {
  Box,
  Typography,
  FormControl,
  InputAdornment,
  CircularProgress,
  Button,
  CardActions,
  Divider,
  Grid,
  type SelectChangeEvent,
  Select,
  MenuItem,
  SvgIcon,
} from '@mui/material'
import { useForm, FormProvider } from 'react-hook-form'

import AddressBookInput from '@/components/common/AddressBookInput'
import NameInput from '@/components/common/NameInput'
import { useAddressResolver } from '@/hooks/useAddressResolver'
import useSafeInfo from '@/hooks/useSafeInfo'
import { uniqueAddress, addressIsNotCurrentSafe } from '@/utils/validation'
import type { AddOwnerFlowProps } from '.'
import type { ReplaceOwnerFlowProps } from '../ReplaceOwner'
import TxCard from '../../common/TxCard'
import InfoIcon from '@/public/images/notifications/info.svg'
import commonCss from '@/components/tx-flow/common/styles.module.css'

type FormData = (AddOwnerFlowProps | ReplaceOwnerFlowProps)['newOwner']

export const ChooseOwner = ({
  params,
  onSubmit,
}: {
  params: AddOwnerFlowProps | ReplaceOwnerFlowProps
  onSubmit: (data: Pick<AddOwnerFlowProps | ReplaceOwnerFlowProps, 'newOwner' | 'threshold'>) => void
}) => {
  const { safe, safeAddress } = useSafeInfo()

  const formMethods = useForm<FormData>({
    defaultValues: params.newOwner,
    mode: 'onChange',
  })
  const { handleSubmit, formState, watch } = formMethods
  const isValid = Object.keys(formState.errors).length === 0 // do not use formState.isValid because names can be empty

  const notAlreadyOwner = uniqueAddress(safe.owners.map((owner) => owner.value))
  const notCurrentSafe = addressIsNotCurrentSafe(safeAddress)
  const combinedValidate = (address: string) => notAlreadyOwner(address) || notCurrentSafe(address)

  const address = watch('address')

  const { name, ens, resolving } = useAddressResolver(address)

  const [selectedThreshold, setSelectedThreshold] = useState<number>(params.threshold || 1)

  const handleChange = (event: SelectChangeEvent<number>) => {
    setSelectedThreshold(parseInt(event.target.value.toString()))
  }

  // Address book, ENS
  const fallbackName = name || ens

  const onFormSubmit = handleSubmit((formData: FormData) => {
    onSubmit({
      newOwner: {
        ...formData,
        name: formData.name || fallbackName,
      },
      threshold: selectedThreshold,
    })
  })

  const newNumberOfOwners = safe.owners.length + 1

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={onFormSubmit} className={commonCss.form}>
          <Box mb={1}>
            {params.removedOwner &&
              'Review the owner you want to replace in the active Safe Account, then specify the new owner you want to replace it with:'}
          </Box>

          {params.removedOwner && (
            <Box my={2}>
              <Typography mb={1}>Current owner</Typography>
              <EthHashInfo address={params.removedOwner.address} showCopyButton shortAddress={false} hasExplorer />
            </Box>
          )}

          <FormControl fullWidth>
            <NameInput
              label="New owner"
              name="name"
              placeholder={fallbackName || 'Owner name'}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: resolving && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          <FormControl fullWidth>
            <AddressBookInput name="address" label="Owner address or ENS" validate={combinedValidate} required />
          </FormControl>

          <Divider className={commonCss.nestedDivider} />

          <FormControl fullWidth>
            <Box display="flex" flexDirection="row" alignItems="center" gap={1} mt={3}>
              <Typography variant="h6" fontWeight="bold">
                Threshold
              </Typography>
              <SvgIcon component={InfoIcon} color="disabled" inheritViewBox fontSize="small" />
            </Box>

            <Typography variant="body2" mb={1}>
              Any transaction requires the confirmation of:
            </Typography>

            <Grid container direction="row" alignItems="center" gap={1} pt={1}>
              <Grid item xs={1.5}>
                <Select value={selectedThreshold} onChange={handleChange} fullWidth>
                  {safe.owners.map((_, idx) => (
                    <MenuItem key={idx + 1} value={idx + 1}>
                      {idx + 1}
                    </MenuItem>
                  ))}
                  <MenuItem key={newNumberOfOwners} value={newNumberOfOwners}>
                    {newNumberOfOwners}
                  </MenuItem>
                </Select>
              </Grid>
              <Grid item>
                <Typography>out of {newNumberOfOwners} owner(s)</Typography>
              </Grid>
            </Grid>
          </FormControl>

          <Divider className={commonCss.nestedDivider} />

          <CardActions>
            <Button variant="contained" type="submit" disabled={!isValid || resolving}>
              Next
            </Button>
          </CardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}
