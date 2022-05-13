import { AddressInfo } from '@/components/common/AddressInfo'
import Hairline from '@/components/common/Hairline'
import { Col } from '@/components/common/layout/Col'
import { Row } from '@/components/common/layout/Row'
import { createSwapOwnerTransaction } from '@/services/createTransaction'
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

  createSwapOwnerTransaction({
    newOwnerAddress: newOwner.address,
    oldOwnerAddress: removeOwner.address,
  })

  return (
    <>
      <DialogContent>
        <Hairline />
        <div>
          <Row>
            <Col className={`${css.detailsBlock}`}>
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
            </Col>
            <Col>
              <p style={{ paddingLeft: '1rem' }}>{safe?.owners.length ?? 0} Safe owner(s)</p>
              <Hairline />
              {safe?.owners
                .filter((owner) => owner.value !== removeOwner.address)
                .map((owner) => (
                  <>
                    <Row className={css.padding} key={owner.value}>
                      <AddressInfo address={owner.value} />
                    </Row>
                    <Hairline />
                  </>
                ))}
              <div className={css.info}>
                <p className={css.overline}>REMOVING OWNER &darr;</p>
              </div>
              <Hairline />
              <Row className={`${css.padding} ${css.removedOwner}`}>
                <AddressInfo address={removeOwner.address} />
              </Row>
              <Hairline />
              <div className={css.info}>
                <p className={css.overline}>ADDING NEW OWNER &darr;</p>
              </div>
              <Hairline />
              <Row className={css.padding}>
                <AddressInfo address={newOwner.address} />
              </Row>
            </Col>
          </Row>
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
