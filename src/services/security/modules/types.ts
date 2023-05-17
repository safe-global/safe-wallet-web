export const enum SecuritySeverity {
  HIGH = 'HIGH',
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
