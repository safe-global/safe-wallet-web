import { AddressInfo } from '@/components/common/AddressInfo'
import Hairline from '@/components/common/Hairline'
import useSafeInfo from '@/services/useSafeInfo'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Button, DialogActions, DialogContent, Grid, Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'
import proposeTx from '@/services/proposeTransaction'

import css from './styles.module.css'
import { createSwapOwnerTransaction } from '@/services/createTransaction'

export const SubmitOwnerTxStep = ({
  onBack,
  removeOwner,
  newOwner,
}: {
  onBack: () => void
  removeOwner: { address: string; name?: string }
  newOwner: { address: string; name?: string }
}) => {
  const { safe } = useSafeInfo()

  const [swapTx, setSwapTx] = useState<SafeTransaction>()

  useEffect(() => {
    let isMounted = true
    const createTx = async () => {
      const tx = await createSwapOwnerTransaction({
        newOwnerAddress: newOwner.address,
        oldOwnerAddress: removeOwner.address,
      })
      if (isMounted) {
        setSwapTx(tx)
      }
    }

    createTx()

    return () => {
      isMounted = false
    }
  }, [newOwner.address, removeOwner.address])

  const onSubmit = async () => {
    if (swapTx && safe) {
      proposeTx(safe.chainId, safe.address.value, swapTx)
    }
  }

  return (
    <>
      <DialogContent style={{ padding: 0 }}>
        <Hairline />
        <Grid container spacing={2} style={{ paddingLeft: '24px', paddingTop: '20px' }}>
          <Grid direction="column" item className={`${css.detailsBlock}`}>
            <p className={css.large}>Details</p>
            <div className={css.detailField}>
              <p className={css.light}>Safe name:</p>
              {/* TODO: SafeName */}
              <p>Name Placeholder</p>
            </div>
            <div className={css.detailField}>
              <p className={css.light}>Any transaction requires the confirmation of:</p>
              <p>
                <b>{safe?.threshold}</b> out of <b>{safe?.owners.length}</b> owners
              </p>
            </div>
          </Grid>
          <Grid direction="column">
            <p style={{ paddingLeft: '1rem' }}>{safe?.owners.length ?? 0} Safe owner(s)</p>
            <Hairline />
            {safe?.owners
              .filter((owner) => owner.value !== removeOwner.address)
              .map((owner) => (
                <>
                  <div className={css.padding} key={owner.value}>
                    <AddressInfo address={owner.value} />
                  </div>
                  <Hairline />
                </>
              ))}
            <div className={css.info}>
              <p className={css.overline}>REMOVING OWNER &darr;</p>
            </div>
            <Hairline />
            <div className={`${css.padding} ${css.removedOwner}`}>
              <AddressInfo address={removeOwner.address} />
            </div>
            <Hairline />
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
      </DialogContent>
      <DialogActions className={css.dialogFooter}>
        <Button onClick={onBack}>Back</Button>
        <Button onClick={onSubmit} disabled={!swapTx} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </>
  )
}
