import { useMemo } from 'react'
import { Box, Button, DialogContent, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import uniqBy from 'lodash/uniqBy'
import { FormProvider, useForm, Controller } from 'react-hook-form'
import AddressBookInput from '@/components/common/AddressBookInput'
import { parsePrefixedAddress } from '@/utils/addresses'
import SendFromBlock from '../../SendFromBlock'
import useAllCollectibles from './useAllCollectibles'
import ErrorMessage from '../../ErrorMessage'

enum Field {
  recipient = 'recipient',
  tokenAddress = 'tokenAddress',
  tokenId = 'tokenId',
}

export type SendNftFormData = {
  [Field.recipient]: string
  [Field.tokenAddress]: string
  [Field.tokenId]: string
}

type SendNftFormProps = {
  onSubmit: (data: SendNftFormData) => void
  formData: SendNftFormData
}

const NftMenuItem = ({ image, name }: { image: string | null; name: string }) => (
  <Grid container spacing={1}>
    <Grid item>
      <Box width={20} height={20} overflow="hidden">
        <img src={image || '/images/nft-placeholder.png'} alt={name} height={20} />
      </Box>
    </Grid>
    <Grid item>{name}</Grid>
  </Grid>
)

const CollectionMenuItem = ({ address, name }: { address: string; name: string }) => (
  <Grid container spacing={1}>
    <Grid item>{name}</Grid>
    <Grid item>
      <Typography component="span" variant="body2" color="secondary.light">
        {address}
      </Typography>
    </Grid>
  </Grid>
)

const SendNftForm = ({ formData, onSubmit }: SendNftFormProps) => {
  const formMethods = useForm<SendNftFormData>({
    defaultValues: {
      [Field.recipient]: formData?.[Field.recipient] || '',
      [Field.tokenAddress]: formData?.[Field.tokenAddress] || '',
      [Field.tokenId]: formData?.[Field.tokenId] || '',
    },
  })
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = formMethods

  const onFormSubmit = (data: SendNftFormData) => {
    onSubmit({
      ...data,
      recipient: parsePrefixedAddress(data.recipient).address,
    })
  }

  // All NFTs
  const [nfts = [], nftsError, nftsLoading] = useAllCollectibles()

  // Collections
  const collections = useMemo(() => uniqBy(nfts, 'address'), [nfts])

  // Individual tokens
  const selectedCollection = watch(Field.tokenAddress)
  const selectedTokens = useMemo(
    () => nfts.filter((item) => item.address === selectedCollection),
    [nfts, selectedCollection],
  )

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <SendFromBlock />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <AddressBookInput name={Field.recipient} label="Recipient" />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="asset-label">Select an NFT collection</InputLabel>
            <Controller
              rules={{ required: true, onChange: () => setValue(Field.tokenId, '') }}
              name={Field.tokenAddress}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="asset-label"
                  label={errors.tokenAddress?.message || 'Select an NFT collection'}
                  error={!!errors.tokenAddress}
                >
                  {collections.map((item) => (
                    <MenuItem key={item.address} value={item.address}>
                      <CollectionMenuItem name={item.tokenName} address={item.address} />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="asset-label">Select an NFT</InputLabel>
            <Controller
              rules={{ required: true }}
              name={Field.tokenId}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="asset-label"
                  label={errors.tokenId?.message || 'Select an NFT'}
                  error={!!errors.tokenId}
                  disabled={nftsLoading}
                >
                  {selectedTokens.map((item) => (
                    <MenuItem key={item.address + item.id} value={item.id}>
                      <NftMenuItem image={item.imageUri} name={item.name || `${item.tokenName} #${item.id}`} />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          {nftsError && <ErrorMessage>Failed to load NFTs</ErrorMessage>}
        </DialogContent>

        <Button variant="contained" type="submit" disabled={nftsLoading}>
          {nftsLoading ? 'Loading...' : 'Next'}
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendNftForm
