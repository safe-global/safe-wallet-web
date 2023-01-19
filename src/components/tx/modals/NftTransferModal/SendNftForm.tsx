import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  DialogContent,
  FormControl,
  Grid,
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
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import ImageFallback from '@/components/common/ImageFallback'
import useAddressBook from '@/hooks/useAddressBook'
import SendToBlock from '@/components/tx/SendToBlock'
import InfiniteScroll from '@/components/common/InfiniteScroll'

enum Field {
  recipient = 'recipient',
  tokenId = 'tokenId',
}

type FormData = {
  [Field.recipient]: string
  [Field.tokenId]: string
}

export type SendNftFormProps = {
  onSubmit: (data: NftTransferParams) => void
  params?: NftTransferParams
}

const toNftValue = (nft: SafeCollectibleResponse): string => `${nft.address};${nft.id}`

const parseNftValue = (value: string): { address: string; id: string } => {
  const splitValue = value.split(';')
  return {
    address: splitValue[0],
    id: splitValue[1],
  }
}

const NftMenuItem = ({ image, name, description }: { image: string; name: string; description?: string }) => (
  <Grid container spacing={1} alignItems="center" wrap="nowrap" sx={{ maxWidth: '530px' }}>
    <Grid item>
      <Box width={20} height={20}>
        <ImageFallback src={image} fallbackSrc="/images/common/nft-placeholder.png" alt={name} height={20} />
      </Box>
    </Grid>
    <Grid item overflow="hidden">
      <Typography overflow="hidden" textOverflow="ellipsis">
        {name}
      </Typography>

      {description && (
        <Typography variant="caption" color="primary.light" display="block" overflow="hidden" textOverflow="ellipsis">
          {description}
        </Typography>
      )}
    </Grid>
  </Grid>
)

const SendNftForm = ({ params, onSubmit }: SendNftFormProps) => {
  const addressBook = useAddressBook()
  const [pageUrl, setPageUrl] = useState<string>()
  const [combinedNfts, setCombinedNfts] = useState<SafeCollectibleResponse[]>(params?.token ? [params.token] : [])
  const [nftData, nftError, nftLoading] = useCollectibles(pageUrl)
  const disabled = nftLoading && !combinedNfts.length

  const formMethods = useForm<FormData>({
    defaultValues: {
      [Field.recipient]: params?.recipient || '',
      [Field.tokenId]: params?.token ? toNftValue(params.token) : '',
    },
  })
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = formMethods

  const recipient = watch(Field.recipient)

  const onFormSubmit = (data: FormData) => {
    const { address: selectedTokenAddress, id: selectedTokenId } = parseNftValue(data.tokenId)
    const token = combinedNfts.find((item) => item.id === selectedTokenId && item.address === selectedTokenAddress)
    if (!token) return
    onSubmit({
      recipient: data.recipient,
      token,
    })
  }

  // Accumulate all loaded NFT pages in one array
  useEffect(() => {
    if (nftData?.results?.length) {
      setCombinedNfts((prev) => uniqBy(prev.concat(nftData.results), (item) => item.address + item.id))
    }
  }, [nftData?.results])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <SendFromBlock />

          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            {addressBook[recipient] ? (
              <Box onClick={() => setValue(Field.recipient, '')}>
                <SendToBlock address={recipient} />
              </Box>
            ) : (
              <AddressBookInput name={Field.recipient} label="Recipient" />
            )}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="asset-label" required>
              Select an NFT
            </InputLabel>

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
                  {combinedNfts.map((item) => (
                    <MenuItem key={item.address + item.id} value={toNftValue(item)}>
                      <NftMenuItem
                        image={item.imageUri || item.logoUri}
                        name={`${item.tokenName || item.tokenSymbol || ''} #${item.id}`}
                        description={`Token ID: ${item.id}${item.name ? ` - ${item.name}` : ''}`}
                      />
                    </MenuItem>
                  ))}

                  {(nftLoading || nftData?.next) && (
                    <MenuItem disabled>
                      {nftLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        nftData?.next && <InfiniteScroll onLoadMore={() => setPageUrl(nftData?.next)} />
                      )}
                    </MenuItem>
                  )}
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
