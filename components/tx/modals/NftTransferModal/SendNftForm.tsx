import { useMemo } from 'react'
import { Box, Button, DialogContent, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import uniqBy from 'lodash/uniqBy'
import { FormProvider, useForm, Controller } from 'react-hook-form'
import AddressBookInput from '@/components/common/AddressBookInput'
import { parsePrefixedAddress } from '@/utils/addresses'
import SendFromBlock from '../../SendFromBlock'
import useAllCollectibles from './useAllCollectibles'
import ErrorMessage from '../../ErrorMessage'
import { type NftTransferParams } from '.'

enum Field {
  recipient = 'recipient',
  tokenAddress = 'tokenAddress',
  tokenId = 'tokenId',
}

type FormData = {
  [Field.recipient]: string
  [Field.tokenAddress]: string
  [Field.tokenId]: string
}

export type SendNftFormProps = {
  onSubmit: (data: NftTransferParams) => void
  params?: NftTransferParams
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

const SendNftForm = ({ params, onSubmit }: SendNftFormProps) => {
  // All NFTs
  const initialNfts = params ? [params.token] : []
  const [nfts = initialNfts, nftsError, nftsLoading] = useAllCollectibles()

  const formMethods = useForm<FormData>({
    defaultValues: {
      [Field.recipient]: params?.recipient || '',
      [Field.tokenAddress]: params?.token.address || '',
      [Field.tokenId]: params?.token.id || '',
    },
  })
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = formMethods

  // Collections
  const collections = useMemo(() => uniqBy(nfts, 'address'), [nfts])

  // Individual tokens
  const selectedCollection = watch(Field.tokenAddress)
  const selectedTokens = useMemo(
    () => nfts.filter((item) => item.address === selectedCollection),
    [nfts, selectedCollection],
  )

  const onFormSubmit = (data: FormData) => {
    const recipient = parsePrefixedAddress(data.recipient).address
    const token = selectedTokens.find((item) => item.id === data.tokenId)
    if (!token) return
    onSubmit({
      recipient,
      token,
    })
  }

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

          {nftsError && !params && <ErrorMessage>Failed to load NFTs</ErrorMessage>}
        </DialogContent>

        <Button variant="contained" type="submit" disabled={nftsLoading && !params}>
          {nftsLoading && !params ? 'Loading...' : 'Next'}
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendNftForm
