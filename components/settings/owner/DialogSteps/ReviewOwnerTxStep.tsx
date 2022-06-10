import { AddressInfo } from '@/components/common/AddressInfo'
import Hairline from '@/components/common/Hairline'
import useSafeInfo from '@/services/useSafeInfo'
import { Box, Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import { useDispatch } from 'react-redux'
import { showNotification } from '@/store/notificationsSlice'
import { CodedException, Errors } from '@/services/exceptions'
import { ChangeOwnerData } from '@/components/settings/owner/DialogSteps/data'
import useWallet from '@/services/wallets/useWallet'
import { getSafeSDK } from '@/services/safe-core/safeCoreSDK'
import { createTx, dispatchTxProposal, dispatchTxSigning } from '@/services/tx/txSender'
import useAsync from '@/services/useAsync'
import { useCallback } from 'react'
import { ReviewTxForm, ReviewTxFormData } from '@/components/tx/ReviewTxForm'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'

export const ReviewOwnerTxStep = ({ data, onClose }: { data: ChangeOwnerData; onClose: () => void }) => {
  const { safe } = useSafeInfo()
  const connectedWallet = useWallet()
  const dispatch = useDispatch()
  const { newOwner, removedOwner, threshold } = data

  const sdk = getSafeSDK()
  const createChangeOwnerTx = useCallback(
    removedOwner
      ? () =>
          sdk.getSwapOwnerTx({
            newOwnerAddress: newOwner.address,
            oldOwnerAddress: removedOwner.address,
          })
      : () =>
          sdk.getAddOwnerTx({
            ownerAddress: newOwner.address,
            threshold,
          }),
    [removedOwner, newOwner, threshold, sdk],
  )
  const [changeOwnerTx, error, loading] = useAsync(createChangeOwnerTx, [createChangeOwnerTx])
  if (error) {
    const { message } = new CodedException(Errors._803, error.message)
    dispatch(showNotification({ message }))
  }

  const isReplace = Boolean(removedOwner)

  const onSubmit = async (data: ReviewTxFormData) => {
    if (safe && connectedWallet && changeOwnerTx) {
      try {
        // overwrite nonce and safeTxGas
        const editedOwnerTxData = {
          ...changeOwnerTx.data,
          nonce: data.nonce,
          safeTxGas: data.safeTxGas,
        }
        const editedOwnerTx = await createTx(editedOwnerTxData)
        const signedTx = await dispatchTxSigning(editedOwnerTx)
        await dispatchTxProposal(safe.chainId, safe.address.value, connectedWallet.address, signedTx)
        if (typeof newOwner.name !== 'undefined') {
          dispatch(
            upsertAddressBookEntry({
              chainId: safe.chainId,
              address: newOwner.address,
              name: newOwner.name,
            }),
          )
        }
      } catch (err) {
        const { message } = new CodedException(Errors._804, (err as Error).message)
        dispatch(showNotification({ message }))
      }
      onClose()
    }
  }

  return (
    <div className={css.container}>
      <Typography variant="h6">Review transaction</Typography>
      <Grid container spacing={2} style={{ paddingLeft: '24px', paddingTop: '20px' }}>
        <Grid direction="column" xs item className={`${css.detailsBlock}`}>
          <Typography>Details</Typography>
          <Box marginBottom={2}>
            <Typography>Safe name:</Typography>
            {/* TODO: SafeName */}
            <Typography>Name Placeholder</Typography>
          </Box>
          <Box marginBottom={2}>
            <Typography>Any transaction requires the confirmation of:</Typography>
            <Typography>
              <b>{threshold}</b> out of <b>{(safe?.owners.length ?? 0) + (isReplace ? 0 : 1)}</b> owners
            </Typography>
          </Box>
        </Grid>
        <Grid direction="column">
          <Typography style={{ paddingLeft: '1rem' }}>{safe?.owners.length ?? 0} Safe owner(s)</Typography>
          <Hairline />
          {safe?.owners
            .filter((owner) => !removedOwner || owner.value !== removedOwner.address)
            .map((owner) => (
              <div key={owner.value}>
                <Box padding="1rem" key={owner.value}>
                  <AddressInfo address={owner.value} />
                </Box>
                <Hairline />
              </div>
            ))}
          {removedOwner && (
            <>
              <div className={css.info}>
                <Typography className={css.overline}>REMOVING OWNER &darr;</Typography>
              </div>
              <Hairline />
              <Box className={css.removedOwner} padding="1rem">
                <AddressInfo address={removedOwner.address} />
              </Box>
              <Hairline />
            </>
          )}
          <div className={css.info}>
            <Typography className={css.overline}>ADDING NEW OWNER &darr;</Typography>
          </div>
          <Hairline />
          <Box padding={'1rem'}>
            <AddressInfo address={newOwner.address} />
          </Box>
        </Grid>
      </Grid>
      <ReviewTxForm onFormSubmit={onSubmit} txParams={changeOwnerTx?.data} />
    </div>
  )
}
