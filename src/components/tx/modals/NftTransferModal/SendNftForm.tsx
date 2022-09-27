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

const NftMenuItem = ({ image, name, description }: { image: string; name: string; description?: string }) => (
  <Grid container spacing={1} alignItems="center" wrap="nowrap">
    <Grid item>
      <Box width={20} height={20} overflow="hidden">
        <ImageFallback src={image} fallbackSrc="/images/nft-placeholder.png" alt={name} height={20} />
      </Box>
    </Grid>
    <Grid item>
      {name}
      {description && (
        <Typography
          variant="caption"
          color="primary.light"
          display="block"
          width="80%"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {description}
        </Typography>
      )}
    </Grid>
  </Grid>
)

const SendNftForm = ({ params, onSubmit }: SendNftFormProps) => {
  const [pageUrl, setPageUrl] = useState<string>()
  const [combinedNfts, setCombinedNfts] = useState<SafeCollectibleResponse[]>()
  const [nftData, nftError, nftLoading] = useCollectibles(pageUrl)
  const allNfts = useMemo(() => combinedNfts ?? (params?.token ? [params.token] : []), [combinedNfts, params?.token])
  const disabled = nftLoading && !allNfts.length

  const formMethods = useForm<FormData>({
    defaultValues: {
      [Field.recipient]: params?.recipient || '',
      [Field.tokenAddress]: params?.token?.address || '',
      [Field.tokenId]: params?.token?.id || '',
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
    const token = selectedTokens.find((item) => item.id === data.tokenId)
    if (!token) return
    onSubmit({
      recipient: data.recipient,
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

          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
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
                  {collections.map((item) => {
                    const count = allNfts.filter((nft) => nft.address === item.address).length
                    return (
                      <MenuItem key={item.address} value={item.address}>
                        <NftMenuItem
                          image={item.imageUri || item.logoUri}
                          name={item.tokenName}
                          description={`Count: ${count} ${name}`}
                        />
                      </MenuItem>
                    )
                  })}
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
                      <NftMenuItem
                        image={item.imageUri || item.logoUri}
                        name={item.name || item.tokenName}
                        description={`Token ID: ${item.id}`}
                      />
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
