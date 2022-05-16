import { AddressInfo } from '@/components/common/AddressInfo'
import Hairline from '@/components/common/Hairline'
import useSafeInfo from '@/services/useSafeInfo'
import { Button, Grid } from '@mui/material'
import proposeTx from '@/services/proposeTransaction'

import css from './styles.module.css'
import { createSwapOwnerTransaction, signTransaction } from '@/services/createTransaction'
import { ReplaceOwnerData } from '@/components/settings/owner/ReplaceOwnerDialog/ChooseOwnerStep'

export const SubmitOwnerTxStep = ({ data }: { data: ReplaceOwnerData }) => {
  const { safe } = useSafeInfo()

  const { newOwner, removedOwner } = data

  const onSubmit = async () => {
    if (safe) {
      let swapTx = await createSwapOwnerTransaction({
        newOwnerAddress: newOwner.address,
        oldOwnerAddress: removedOwner.address,
      })
      swapTx = await signTransaction(swapTx)
      proposeTx(safe.chainId, safe.address.value, swapTx)
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
        <Button onClick={onSubmit} variant="contained">
          Submit
        </Button>
      </div>
    </div>
  )
}
