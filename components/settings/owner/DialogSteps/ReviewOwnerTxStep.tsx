import { EthHashInfo } from '@/components/common/AddressInfo'
import useSafeInfo from '@/services/useSafeInfo'
import { Box, Divider, Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import { showNotification } from '@/store/notificationsSlice'
import { CodedException, Errors } from '@/services/exceptions'
import { ChangeOwnerData } from '@/components/settings/owner/DialogSteps/data'
import useWallet from '@/services/wallets/useWallet'
import { getSafeSDK } from '@/services/safe-core/safeCoreSDK'
import { createTx, dispatchTxProposal, dispatchTxSigning } from '@/services/tx/txSender'
import useAsync from '@/services/useAsync'
import { ReviewTxForm, ReviewTxFormData } from '@/components/tx/ReviewTxForm'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { useEffect } from 'react'
import { useAppDispatch } from '@/store'

export const ReviewOwnerTxStep = ({ data, onClose }: { data: ChangeOwnerData; onClose: () => void }) => {
  const { safe } = useSafeInfo()
  const connectedWallet = useWallet()
  const dispatch = useAppDispatch()
  const { newOwner, removedOwner, threshold } = data

  const [changeOwnerTx, error, loading] = useAsync(() => {
    const sdk = getSafeSDK()

    if (removedOwner) {
      return sdk.getSwapOwnerTx({
        newOwnerAddress: newOwner.address,
        oldOwnerAddress: removedOwner.address,
      })
    } else {
      return sdk.getAddOwnerTx({
        ownerAddress: newOwner.address,
        threshold,
      })
    }
  }, [removedOwner, newOwner])

  useEffect(() => {
    if (error) {
      const { message } = new CodedException(Errors._803, error.message)
      dispatch(showNotification({ message, options: { variant: 'error' } }))
    }
  }, [error, dispatch])

  const isReplace = Boolean(removedOwner)

  const onSubmit = async (data: ReviewTxFormData) => {
    if (!safe || !connectedWallet || !changeOwnerTx) {
      return
    }
    try {
      // overwrite nonce and safeTxGas
      const editedOwnerTxData = {
        ...changeOwnerTx.data,
        nonce: data.nonce,
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
          <Typography paddingLeft={2}>{safe?.owners.length ?? 0} Safe owner(s)</Typography>
          <Divider />
          {safe?.owners
            .filter((owner) => !removedOwner || owner.value !== removedOwner.address)
            .map((owner) => (
              <div key={owner.value}>
                <Box padding={2} key={owner.value}>
                  <EthHashInfo address={owner.value} />
                </Box>
                <Divider />
              </div>
            ))}
          {removedOwner && (
            <>
              <div className={css.info}>
                <Typography className={css.overline}>REMOVING OWNER &darr;</Typography>
              </div>
              <Divider />
              <Box className={css.removedOwner} padding={2}>
                <EthHashInfo address={removedOwner.address} />
              </Box>
              <Divider />
            </>
          )}
          <div className={css.info}>
            <Typography className={css.overline}>ADDING NEW OWNER &darr;</Typography>
          </div>
          <Divider />
          <Box padding={2}>
            <EthHashInfo address={newOwner.address} />
          </Box>
        </Grid>
      </Grid>
      <ReviewTxForm onFormSubmit={onSubmit} txParams={changeOwnerTx?.data} />
    </div>
  )
}
