import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  DialogContent,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import uniqBy from 'lodash/uniqBy'
import { FormProvider, useForm, Controller } from 'react-hook-form'
import AddressBookInput from '@/components/common/AddressBookInput'
import { parsePrefixedAddress } from '@/utils/addresses'
import SendFromBlock from '../../SendFromBlock'
import ErrorMessage from '../../ErrorMessage'
import { type NftTransferParams } from '.'
import useCollectibles from '@/hooks/useCollectibles'
import { SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import ImageFallback from '@/components/common/ImageFallback'

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

const NftMenuItem = ({ image, name }: { image: string; name: string }) => (
  <Grid container spacing={1}>
    <Grid item>
      <Box width={20} height={20} overflow="hidden">
        <ImageFallback src={image} fallbackSrc="/images/nft-placeholder.png" alt={name} height={20} />
      </Box>
    </Grid>
    <Grid item>{name}</Grid>
  </Grid>
)

const CollectionMenuItem = ({ address, name }: { address: string; name: string }) => (
  <Grid container>
    <Grid item pr={1}>
      {name}
    </Grid>
    <Grid item>
      <Typography component="span" variant="body2" color="secondary.light">
        {address}
      </Typography>
    </Grid>
  </Grid>
)

const SendNftForm = ({ params, onSubmit }: SendNftFormProps) => {
  const [pageUrl, setPageUrl] = useState<string>()
  const [combinedNfts, setCombinedNfts] = useState<SafeCollectibleResponse[]>()
  const [nftData, nftError, nftLoading] = useCollectibles(pageUrl)
  const allNfts = useMemo(() => combinedNfts ?? (params ? [params.token] : []), [combinedNfts, params])
  const disabled = nftLoading && !allNfts.length

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
  const collections = useMemo(() => uniqBy(allNfts, 'address'), [allNfts])

  // Individual tokens
  const selectedCollection = watch(Field.tokenAddress)
  const selectedTokens = useMemo(
    () => allNfts.filter((item) => item.address === selectedCollection),
    [allNfts, selectedCollection],
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

  // Repeatedly load all NFTs page by page
  useEffect(() => {
    if (nftData?.results?.length) {
      setCombinedNfts((prev) => (prev || []).concat(nftData.results))
    }

    if (nftData?.next) {
      setPageUrl(nftData.next)
    }
  }, [nftData])

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
                  endAdornment={
                    nftLoading && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} sx={{ mr: 3 }} />
                      </InputAdornment>
                    )
                  }
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
                >
                  {selectedTokens.map((item) => (
                    <MenuItem key={item.address + item.id} value={item.id}>
                      <NftMenuItem image={item.logoUri} name={`${item.tokenName} #${item.id}`} />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          {nftError && !params && <ErrorMessage>Failed to load NFTs</ErrorMessage>}
        </DialogContent>

        <Button variant="contained" type="submit" disabled={disabled}>
          {disabled ? 'Loading...' : 'Next'}
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendNftForm
