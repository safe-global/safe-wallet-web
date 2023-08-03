import { RedefineMessage } from './redefine'
import { TxSimulationMessage } from './tenderly'

const SecurityWarnings = () => (
  <>
    <RedefineMessage />
    <TxSimulationMessage />
  </>
)

export default SecurityWarnings
