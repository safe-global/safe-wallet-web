import { AddressInfo } from '@/components/common/AddressInfo'
import Hairline from '@/components/common/Hairline'
import useSafeInfo from '@/services/useSafeInfo'
import { Button, Grid } from '@mui/material'
import proposeTx from '@/services/proposeTransaction'

import css from './styles.module.css'
import { createAddOwnerTransaction, createSwapOwnerTransaction, signTransaction } from '@/services/createTransaction'
import { useDispatch } from 'react-redux'
import { showNotification } from '@/store/notificationsSlice'
import { CodedException, Errors } from '@/services/exceptions'
import { ChangeOwnerData } from '@/components/settings/owner/DialogSteps/data'

export const ReviewOwnerTxStep = ({ data, onClose }: { data: ChangeOwnerData; onClose: () => void }) => {
  const { safe } = useSafeInfo()
  const dispatch = useDispatch()

  const { newOwner, removedOwner, threshold } = data

  const isReplace = Boolean(removedOwner)

  const onSubmit = async () => {
    if (safe) {
      try {
        let changeOwnerTx
        if (removedOwner) {
          changeOwnerTx = await createSwapOwnerTransaction({
            newOwnerAddress: newOwner.address,
            oldOwnerAddress: removedOwner.address,
          })
        } else {
          changeOwnerTx = await createAddOwnerTransaction({
            ownerAddress: newOwner.address,
            threshold,
          })
        }
        changeOwnerTx = await signTransaction(changeOwnerTx)
        proposeTx(safe.chainId, safe.address.value, changeOwnerTx)
      } catch (err) {
        const { message } = new CodedException(Errors._804, (err as Error).message)
        dispatch(showNotification({ message }))
      }
      onClose()
    }
  }

  return (
    <div className={css.container}>
      <div className={css.noPadding}>
        <Hairline />
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
        <Hairline />
      </div>
      <div className={css.submit}>
        <Button onClick={onSubmit} variant="contained">
          Submit
        </Button>
      </div>
    </div>
  )
}
