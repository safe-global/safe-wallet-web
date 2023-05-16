export interface SecurityModule<Req, Res> {
  scanTransaction(request: Req, callback: (response: Res) => void): void
}
