import { type TransactionInsightModule } from './modules'
import { ApprovalModule } from './modules/ApprovalModule'
import { UnknownAddressModule } from './modules/UnknownAddressModule'

export const enum InsightModuleNames {
  APPROVAL = 'APPROVAL',
  UNKNOWN_ADDRESS = 'UNKNOWN_ADDRESS',
}

const InsightModules = {
  [InsightModuleNames.APPROVAL]: new ApprovalModule(),
  [InsightModuleNames.UNKNOWN_ADDRESS]: new UnknownAddressModule(),
} as const

type Modules = typeof InsightModules

type Req<T extends InsightModuleNames> = Modules[T] extends TransactionInsightModule<infer R, unknown> ? R : never
type Res<T extends InsightModuleNames> = Modules[T] extends TransactionInsightModule<unknown, infer R> ? R : never

export function dispatchTxScan<Type extends InsightModuleNames, Request extends Req<Type>, Response extends Res<Type>>({
  type,
  request,
  callback,
}: {
  type: Type
  request: Request
  callback: (res: Response) => void
}) {
  let isSubscribed = true

  const InsightModule = InsightModules[type] as unknown as TransactionInsightModule<Request, Response>

  InsightModule.scanTransaction(request, (res: Response) => {
    if (isSubscribed) {
      callback(res)
    }
  })

  return () => {
    isSubscribed = false
  }
}
