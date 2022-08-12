export const base = 8

const getSpacings = (max: number) => {
  const spacings: Record<number, number> = {}

  for (let i = 1; i <= max; i++) {
    spacings[i] = base * i
  }

  return spacings
}

const spacings = getSpacings(12)

export default spacings
