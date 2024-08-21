import { useDarkMode } from '@/hooks/useDarkMode'
import { useTheme } from '@mui/material/styles'
import partition from 'lodash/partition'
import useChains from '@/hooks/useChains'
import { useRouter } from 'next/router'
import { useChainId } from '@/hooks/useChainId'
import { type ReactElement, useMemo, useState } from 'react'
import useWallet from '@/hooks/wallets/useWallet'
import { useAppSelector } from '@/store'
import { selectChains } from '@/store/chainsSlice'
import { Autocomplete, TextField } from '@mui/material'

// const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4']

const NetworkMultiSelector = ({
  onChainsUpdate,
}: {
  onChainsUpdate: (selectedChains: string[]) => void
}): ReactElement => {
  const isDarkMode = useDarkMode()
  const theme = useTheme()
  const { configs } = useChains()
  const chainId = useChainId()
  const router = useRouter()
  const isWalletConnected = !!useWallet()
  const [testNets, prodNets] = useMemo(() => partition(configs, (config) => config.isTestnet), [configs])
  const chains = useAppSelector(selectChains)

  const options = prodNets.map((network) => network.chainName)

  const [values, setValues] = useState<string[]>([])

  return (
    <Autocomplete
      fullWidth
      disableCloseOnSelect
      multiple
      value={values}
      onChange={(event: any, selectedChains: string[]) => {
        setValues(selectedChains)
        onChainsUpdate(selectedChains)
      }}
      inputValue=""
      onInputChange={() => {}}
      options={options}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Add new network" />}
    />
  )
}

export default NetworkMultiSelector
