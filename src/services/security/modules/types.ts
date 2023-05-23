export const enum SecuritySeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  NONE = 'NONE',
}

export type SecurityResponse<Res> =
  | {
      severity: SecuritySeverity
      payload: Res
    }
  | {
      severity: SecuritySeverity.NONE
      payload?: never
    }

export interface SecurityModule<Req, Res> {
  scanTransaction(request: Req): Promise<SecurityResponse<Res>>
}
