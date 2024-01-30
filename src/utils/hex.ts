export const isEmptyHexData = (encodedData: string) => encodedData && isNaN(parseInt(encodedData, 16))

export const numberToHex = (value: number) => `0x${value.toString(16)}`
