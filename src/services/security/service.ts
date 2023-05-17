import { type SecurityModule } from './modules/types'
import { ApprovalModule } from './modules/ApprovalModule'
import { RedefineModule } from './modules/RedefineModule'
import { UnknownAddressModule } from './modules/UnknownAddressModule'
import { UnusedAddressModule } from './modules/UnusedAddressModule'

export const enum SecurityModuleNames {
  APPROVAL = 'APPROVAL',
  REDEFINE = 'REDEFINE',
  UNKNOWN_ADDRESS = 'UNKNOWN_ADDRESS',
  UNUSED_ADDRESS = 'UNUSED_ADDRESS',
}

const SecurityModules = {
  [SecurityModuleNames.APPROVAL]: new ApprovalModule(),
  [SecurityModuleNames.REDEFINE]: new RedefineModule(),
  [SecurityModuleNames.UNKNOWN_ADDRESS]: new UnknownAddressModule(),
  [SecurityModuleNames.UNUSED_ADDRESS]: new UnusedAddressModule(),
} as const

type Modules = typeof SecurityModules

type Req<T extends SecurityModuleNames> = Modules[T] extends SecurityModule<infer R, unknown> ? R : never
type Res<T extends SecurityModuleNames> = Modules[T] extends SecurityModule<unknown, infer R> ? R : never

export async function dispatchTxScan<
  Type extends SecurityModuleNames,
  Request extends Req<Type>,
  Response extends Res<Type>,
>({ type, request }: { type: Type; request: Request }) {
  const InsightModule = SecurityModules[type] as unknown as SecurityModule<Request, Response>

  return InsightModule.scanTransaction(request)
}
