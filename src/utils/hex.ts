export const isEmptyHexData = (encodedData: string) => encodedData && isNaN(parseInt(encodedData, 16))
