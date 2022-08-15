export type NamedAddress = {
  name: string
  address: string
}

export type SafeFormData = NamedAddress & {
  threshold: number
  owners: NamedAddress[]
}
