import { Box, Button, DialogContent, FormControl, Grid, SvgIcon, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import NftIcon from '@/public/images/common/nft.svg'
import AddressBookInput from '@/components/common/AddressBookInput'
import SendFromBlock from '../../SendFromBlock'
import { type NftTransferParams } from '.'
import ImageFallback from '@/components/common/ImageFallback'
import useAddressBook from '@/hooks/useAddressBook'
import SendToBlock from '@/components/tx/SendToBlock'

enum Field {
  recipient = 'recipient',
}

type FormData = {
  [Field.recipient]: string
}

export type SendNftBatchProps = {
  onSubmit: (data: NftTransferParams) => void
  params: NftTransferParams
}

const NftItem = ({ image, name, description }: { image: string; name: string; description?: string }) => (
  <Grid container spacing={1} alignItems="center" wrap="nowrap" mb={2}>
    <Grid item>
      <Box width={20} height={20}>
        <ImageFallback
          src={image}
          fallbackSrc=""
          fallbackComponent={<SvgIcon component={NftIcon} inheritViewBox width={20} height={20} />}
          alt={name}
          height={20}
        />
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

const SendNftBatch = ({ params, onSubmit }: SendNftBatchProps) => {
  const addressBook = useAddressBook()
  const { tokens } = params

  const formMethods = useForm<FormData>({
    defaultValues: {
      [Field.recipient]: params.recipient || '',
    },
  })
  const { handleSubmit, watch, setValue } = formMethods

  const recipient = watch(Field.recipient)

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      recipient: data.recipient,
      tokens,
    })
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <SendFromBlock title={`Sending ${tokens.length} NFT${tokens.length > 1 ? 's' : ''} from`} />

          <FormControl fullWidth sx={{ mb: 2 }}>
            {addressBook[recipient] ? (
              <Box onClick={() => setValue(Field.recipient, '')} mb={-1.5}>
                <SendToBlock address={recipient} />
              </Box>
            ) : (
              <>
                <Typography color="text.secondary" pb={1}>
                  To
                </Typography>

                <AddressBookInput name={Field.recipient} label="Recipient" />
              </>
            )}
          </FormControl>

          <Typography color="text.secondary" mb={1}>
            Selected NFTs
          </Typography>

          <Box overflow="auto" maxHeight="20vh" minHeight="54px" pr={1}>
            {tokens.map((token) => (
              <NftItem
                key={`${token.address}-${token.id}`}
                image={token.imageUri || token.logoUri}
                name={`${token.tokenName || token.tokenSymbol || ''} #${token.id}`}
                description={`Token ID: ${token.id}${token.name ? ` - ${token.name}` : ''}`}
              />
            ))}
          </Box>
        </DialogContent>

        <Button variant="contained" type="submit">
          Next
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendNftBatch
