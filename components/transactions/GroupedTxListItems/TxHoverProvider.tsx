import { createContext, ReactElement, ReactNode, useState } from 'react'

type Props = {
  activeHover?: string
  setActiveHover: (activeHover?: string) => void
}

export const TxHoverContext = createContext<Props>({
  activeHover: undefined,
  setActiveHover: () => undefined,
})

export const TxHoverProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [activeHover, setActiveHover] = useState<string | undefined>()

  return <TxHoverContext.Provider value={{ activeHover, setActiveHover }}>{children}</TxHoverContext.Provider>
}
