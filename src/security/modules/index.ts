export interface TransactionInsightModule<Req, Res> {
  scanTransaction(request: Req, callback: (response: Res) => void): void
}
