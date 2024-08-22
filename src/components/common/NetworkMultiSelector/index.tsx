import { useDarkMode } from '@/hooks/useDarkMode'
import { useTheme } from '@mui/material/styles'
import partition from 'lodash/partition'
import useChains from '@/hooks/useChains'
import { type ReactElement, useMemo, useState, useCallback } from 'react'
import { useAppSelector } from '@/store'
import { selectChains } from '@/store/chainsSlice'
import type { SelectChangeEvent } from '@mui/material'
import { Box, Button, ListSubheader, MenuItem, Select, SvgIcon, Checkbox } from '@mui/material'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import ChainIndicator from '../ChainIndicator'
import AddIcon from '@/public/images/common/add.svg'
import css from './styles.module.css'

const NetworkMultiSelector = ({
  networks,
  onChainsUpdate,
}: {
  networks: ChainInfo[]
  onChainsUpdate: (selectedChains: ChainInfo[]) => void
}): ReactElement => {
  const isDarkMode = useDarkMode()
  const theme = useTheme()
  const { configs } = useChains()
  const [testNets, prodNets] = useMemo(() => partition(configs, (config) => config.isTestnet), [configs])
  const chains = useAppSelector(selectChains)
  // const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const selectedValues = networks.map((chain) => chain.chainId)

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[]
    // setSelectedValues(value)
    const selected = value.map((chainId) => {
      return configs.find((chain) => chain.chainId === chainId)
    })

    onChainsUpdate(selected.filter((item): item is ChainInfo => item !== undefined))
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const renderMenuItem = useCallback(
    (chainId: string, isSelected: boolean) => {
      const chain = chains.data.find((chain) => chain.chainId === chainId)
      if (!chain) return null
      return (
        <MenuItem key={chainId} value={chainId}>
          <Checkbox size="small" checked={isSelected} sx={{ p: 0, pr: 1 }} />
          <ChainIndicator chainId={chain.chainId} inline />
        </MenuItem>
      )
    },
    [chains.data],
  )

  return (
    <Box mt={1}>
      <Button
        disableElevation
        size="small"
        onClick={handleOpen}
        startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
        sx={{ p: 1 }}
      >
        Add new network
      </Button>
      <Select
        multiple
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        value={selectedValues}
        onChange={handleChange}
        renderValue={(selected) => selected.join(', ')}
        sx={{ visibility: 'hidden', height: 0, width: '200px' }}
      >
        {prodNets.map((chain) => renderMenuItem(chain.chainId, selectedValues.includes(chain.chainId)))}

        <ListSubheader className={css.listSubHeader}>Testnets</ListSubheader>

        {testNets.map((chain) => renderMenuItem(chain.chainId, selectedValues.includes(chain.chainId)))}
      </Select>
    </Box>
  )
}

export default NetworkMultiSelector
