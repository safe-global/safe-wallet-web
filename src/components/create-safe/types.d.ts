export type NamedAddress = {
  name: string
  address: string
  ens?: string
}

export type SafeFormData = NamedAddress & {
  threshold: number
  owners: NamedAddress[]
}
