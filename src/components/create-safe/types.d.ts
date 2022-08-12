export type NamedAddress = {
  name: string
  address: string
}

export type SafeFormData = {
  safe: NamedAddress
  threshold: number
  owners: NamedAddress[]
}
