export const enum SecuritySeverity {
  HIGH = 'HIGH',
  LOW = 'LOW',
  NONE = 'NONE',
}

export type SecurityResponse<Res> = {
  severity: SecuritySeverity
  payload: Res
}

export interface SecurityModule<Req, Res> {
  scanTransaction(request: Req, callback: (response: SecurityResponse<Res>) => void): void
}
