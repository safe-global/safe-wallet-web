import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Divider, Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import { createRemoveOwnerTx, createTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { sameAddress } from '@/utils/addresses'
import useAddressBook from '@/hooks/useAddressBook'
import { RemoveOwnerData } from '..'

export const ReviewRemoveOwnerTxStep = ({
  data,
  onSubmit,
}: {
  data: RemoveOwnerData
  onSubmit: (data: null) => void
}) => {
  const { safe } = useSafeInfo()
  const addressBook = useAddressBook()
  const { removedOwner, threshold } = data

  const [removeOwnerTx, createTxError] = useAsync(() => {
    return createRemoveOwnerTx({ ownerAddress: removedOwner.address, threshold })
  }, [removedOwner.address, threshold])

  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    if (!removeOwnerTx) return
    // Reset the nonce to fetch the recommended nonce in createTx
    return createTx({ ...removeOwnerTx.data, nonce: undefined })
  }, [removeOwnerTx])

  // All errors
  const txError = safeTxError || createTxError

  const newOwnerLength = safe ? safe.owners.length - 1 : 1

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      onSubmit={onSubmit}
      isExecutable={safe?.threshold === 1}
      error={txError}
      title="Remove owner"
    >
      <Grid container spacing={2} py={3}>
        <Grid xs item className={`${css.detailsBlock}`}>
          <Typography>Details</Typography>

          <Box marginBottom={2}>
            <Typography>Safe name:</Typography>
            <Typography>{safe ? addressBook[safe?.address.value] || 'No name' : ''}</Typography>
          </Box>
          <Box marginBottom={2}>
            <Typography>Any transaction requires the confirmation of:</Typography>
            <Typography>
              <b>{threshold}</b> out of <b>{newOwnerLength}</b> owners
            </Typography>
          </Box>
        </Grid>

        <Grid>
          <Typography paddingLeft={2}>{newOwnerLength} Safe owner(s)</Typography>
          <Divider />
          {safe?.owners
            .filter((owner) => !sameAddress(owner.value, removedOwner.address))
            .map((owner) => (
              <div key={owner.value}>
                <Box padding={2} key={owner.value}>
                  <EthHashInfo address={owner.value} shortAddress={false} />
                </Box>
                <Divider />
              </div>
            ))}
          {
            <>
              <div className={css.info}>
                <Typography className={css.overline}>Removing owner &darr;</Typography>
              </div>
              <Divider />
              <Box className={css.removedOwner} padding={2}>
                <EthHashInfo address={removedOwner.address} shortAddress={false} />
              </Box>
              <Divider />
            </>
          }
        </Grid>
      </Grid>
    </SignOrExecuteForm>
  )
}
