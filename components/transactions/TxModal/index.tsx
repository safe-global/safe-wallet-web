import { Row } from '@/components/common/layout/Row'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

export const TxModal = ({
  txData,
  onSubmit,
  onBack,
  children,
}: {
  txData: string
  onSubmit: (tx: SafeTransaction) => void
  onBack: () => void
  children: React.ReactNode
}) => {
  return (
    <div>
      {children}
      <Row>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained">Submit</Button>
      </Row>
    </div>
  )
}
