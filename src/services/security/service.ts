import { type SecurityResponse, type SecurityModule } from './modules/types'
import { ApprovalModule } from './modules/ApprovalModule'
import { RedefineModule } from './modules/RedefineModule'
import { UnknownAddressModule } from './modules/UnknownAddressModule'

export const enum SecurityModuleNames {
  APPROVAL = 'APPROVAL',
  REDEFINE = 'REDEFINE',
  UNKNOWN_ADDRESS = 'UNKNOWN_ADDRESS',
}

const SecurityModules = {
  [SecurityModuleNames.APPROVAL]: new ApprovalModule(),
  [SecurityModuleNames.REDEFINE]: new RedefineModule(),
  [SecurityModuleNames.UNKNOWN_ADDRESS]: new UnknownAddressModule(),
} as const

type Modules = typeof SecurityModules

type Req<T extends SecurityModuleNames> = Modules[T] extends SecurityModule<infer R, unknown> ? R : never
type Res<T extends SecurityModuleNames> = Modules[T] extends SecurityModule<unknown, infer R> ? R : never

export function dispatchTxScan<
  Type extends SecurityModuleNames,
  Request extends Req<Type>,
  Response extends Res<Type>,
>({ type, request, callback }: { type: Type; request: Request; callback: (res: SecurityResponse<Response>) => void }) {
  let isSubscribed = true

  const InsightModule = SecurityModules[type] as unknown as SecurityModule<Request, Response>

  InsightModule.scanTransaction(request, (res: SecurityResponse<Response>) => {
    if (isSubscribed) {
      callback(res)
    }
  })

  return () => {
    isSubscribed = false
  }
}
