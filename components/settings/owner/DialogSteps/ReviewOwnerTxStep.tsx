import { AddressInfo } from '@/components/common/AddressInfo'
import Hairline from '@/components/common/Hairline'
import useSafeInfo from '@/services/useSafeInfo'
import { Grid } from '@mui/material'
import css from './styles.module.css'
import { useDispatch } from 'react-redux'
import { showNotification } from '@/store/notificationsSlice'
import { CodedException, Errors } from '@/services/exceptions'
import { ChangeOwnerData } from '@/components/settings/owner/DialogSteps/data'
import useWallet from '@/services/wallets/useWallet'
import { getSafeSDK } from '@/services/safe-core/safeCoreSDK'
import { dispatchTxProposal, dispatchTxSigning } from '@/services/tx/txSender'
import useAsync from '@/services/useAsync'
import { useCallback } from 'react'
import { ReviewTxForm, ReviewTxFormData } from '@/components/tx/ReviewTxForm'

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
    [removedOwner, newOwner, threshold],
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
        const editedOwnerTx = {
          ...changeOwnerTx,
          data: { ...changeOwnerTx.data, nonce: data.nonce, safeTxGas: data.safeTxGas },
        }
        let signedTx = await dispatchTxSigning(editedOwnerTx)
        dispatchTxProposal(safe.chainId, safe.address.value, connectedWallet.address, signedTx)
      } catch (err) {
        const { message } = new CodedException(Errors._804, (err as Error).message)
        dispatch(showNotification({ message }))
      }
      onClose()
    }
  }

  return (
    <ReviewTxForm onFormSubmit={onSubmit} txParams={changeOwnerTx?.data}>
      <Grid container spacing={2} style={{ paddingLeft: '24px', paddingTop: '20px' }}>
        <Grid direction="column" xs item className={`${css.detailsBlock}`}>
          <p>Details</p>
          <div className={css.detailField}>
            <p>Safe name:</p>
            {/* TODO: SafeName */}
            <p>Name Placeholder</p>
          </div>
          <div className={css.detailField}>
            <p>Any transaction requires the confirmation of:</p>
            <p>
              <b>{threshold}</b> out of <b>{(safe?.owners.length ?? 0) + (isReplace ? 0 : 1)}</b> owners
            </p>
          </div>
        </Grid>
        <Grid direction="column">
          <p style={{ paddingLeft: '1rem' }}>{safe?.owners.length ?? 0} Safe owner(s)</p>
          <Hairline />
          {safe?.owners
            .filter((owner) => !removedOwner || owner.value !== removedOwner.address)
            .map((owner) => (
              <div key={owner.value}>
                <div className={css.padding} key={owner.value}>
                  <AddressInfo address={owner.value} />
                </div>
                <Hairline />
              </div>
            ))}
          {removedOwner && (
            <>
              <div className={css.info}>
                <p className={css.overline}>REMOVING OWNER &darr;</p>
              </div>
              <Hairline />
              <div className={`${css.padding} ${css.removedOwner}`}>
                <AddressInfo address={removedOwner.address} />
              </div>
              <Hairline />
            </>
          )}
          <div className={css.info}>
            <p className={css.overline}>ADDING NEW OWNER &darr;</p>
          </div>
          <Hairline />
          <div className={css.padding}>
            <AddressInfo address={newOwner.address} />
          </div>
        </Grid>
      </Grid>
    </ReviewTxForm>
  )
}
