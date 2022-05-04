import { AddressInfo } from '@/components/common/AddressInfo'
import Hairline from '@/components/common/Hairline'
import useSafeInfo from '@/services/useSafeInfo'
import { Button, DialogActions, DialogContent } from '@mui/material'
import css from './styles.module.css'

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

  return (
    <>
      <DialogContent>
        <Hairline />
        <div>
          <div className={css.flexRow}>
            <div className={`${css.flexColumn} ${css.detailsBlock}`}>
              <p className={css.large}>Details</p>
              <div className={css.detailField}>
                <p className={css.light}>Safe name:</p>
                {/* TODO: SafeName */}
                <p>Name Placeholder</p>
              </div>
              <div className={css.detailField}>
                <p className={css.light}>Any transaction requires the confirmation of:</p>
                {/* TODO: SafeName */}
                <p>
                  <b>{safe?.threshold}</b> out of <b>{safe?.owners.length}</b> owners
                </p>
              </div>
            </div>
            <div className={css.flexColumn}>
              <p>{safe?.owners.length ?? 0} Safe owner(s)</p>
              <Hairline />
              <div className={css.info}>
                <p className={css.overline}>REMOVING OWNER &darr;</p>
              </div>
              <Hairline />
              <div className={`${css.flexRowInner} ${css.removedOwner}`}>
                <AddressInfo address={removeOwner.address} />
              </div>
              <Hairline />
              <div className={css.info}>
                <p className={css.overline}>ADDING NEW OWNER &darr;</p>
              </div>
              <Hairline />
              <div className={css.flexRowInner}>
                <AddressInfo address={newOwner.address} />
              </div>
            </div>
          </div>
          <Hairline />
        </div>
      </DialogContent>
      <DialogActions className={css.dialogFooter}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained">Submit</Button>
      </DialogActions>
    </>
  )
}
