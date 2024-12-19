import type { TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import { Safe_to_l2_migration__factory } from '@/types/contracts'
import { sameAddress } from '@/utils/addresses'
import { isMultiSendCalldata } from '@/utils/transaction-calldata'
import { decodeMultiSendData } from '@safe-global/protocol-kit/dist/src/utils'
import { getSafeToL2MigrationDeployment } from '@safe-global/safe-deployments'

export const extractMigrationL2MasterCopyAddress = (txData: TransactionData): string | undefined => {
  if (!isMultiSendCalldata(txData.hexData || '')) {
    return undefined
  }

  const innerTxs = decodeMultiSendData(txData.hexData || '')
  const firstInnerTx = innerTxs[0]
  if (!firstInnerTx) {
    return undefined
  }

  const safeToL2MigrationDeployment = getSafeToL2MigrationDeployment()
  const safeToL2MigrationAddress = safeToL2MigrationDeployment?.defaultAddress
  const safeToL2MigrationInterface = Safe_to_l2_migration__factory.createInterface()

  if (
    firstInnerTx.data.startsWith(safeToL2MigrationInterface.getFunction('migrateToL2').selector) &&
    sameAddress(firstInnerTx.to, safeToL2MigrationAddress)
  ) {
    const callParams = safeToL2MigrationInterface.decodeFunctionData('migrateToL2', firstInnerTx.data)
    return callParams[0]
  }

  return undefined
}
