import { AddressInfo } from '@/components/common/AddressInfo'
import Hairline from '@/components/common/Hairline'
import useSafeInfo from '@/services/useSafeInfo'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Button, Grid } from '@mui/material'
import { useEffect, useState } from 'react'
import proposeTx from '@/services/proposeTransaction'

import css from './styles.module.css'
import { createSwapOwnerTransaction, signTransaction } from '@/services/createTransaction'
import { ReplaceOwnerData } from '@/components/settings/owner/ReplaceOwnerDialog/ChooseOwnerStep'

export const SubmitOwnerTxStep = ({ data }: { data: ReplaceOwnerData }) => {
  const { safe } = useSafeInfo()

  const { newOwner, removedOwner } = data

  const [swapTx, setSwapTx] = useState<SafeTransaction>()

  useEffect(() => {
    let isMounted = true
    const createTx = async () => {
      const tx = await createSwapOwnerTransaction({
        newOwnerAddress: newOwner.address,
        oldOwnerAddress: removedOwner.address,
      })
      if (isMounted) {
        setSwapTx(tx)
      }
    }

    createTx()

    return () => {
      isMounted = false
    }
  }, [newOwner.address, removedOwner.address])

  const onSubmit = async () => {
    if (swapTx && safe) {
      const signedTx = await signTransaction(swapTx)
      proposeTx(safe.chainId, safe.address.value, signedTx)
    }
  }

  return (
    <div className={css.container}>
      <div className={css.noPadding}>
        <Hairline />
        <Grid container spacing={2} style={{ paddingLeft: '24px', paddingTop: '20px' }}>
          <Grid direction="column" xs item className={`${css.detailsBlock}`}>
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
              .filter((owner) => owner.value !== removedOwner.address)
              .map((owner) => (
                <div key={owner.value}>
                  <div className={css.padding} key={owner.value}>
                    <AddressInfo address={owner.value} />
                  </div>
                  <Hairline />
                </div>
              ))}
            <div className={css.info}>
              <p className={css.overline}>REMOVING OWNER &darr;</p>
            </div>
            <Hairline />
            <div className={`${css.padding} ${css.removedOwner}`}>
              <AddressInfo address={removedOwner.address} />
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
      </div>
      <div className={css.submit}>
        <Button onClick={onSubmit} disabled={!swapTx} variant="contained">
          Submit
        </Button>
      </div>
    </div>
  )
}
