export type NamedAddress = {
  name: string
  address: string
  fallbackName?: string
}

export type SafeFormData = NamedAddress & {
  threshold: number
  owners: NamedAddress[]
}
