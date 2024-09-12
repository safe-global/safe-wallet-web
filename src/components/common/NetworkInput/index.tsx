import ChainIndicator from '@/components/common/ChainIndicator'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useTheme } from '@mui/material/styles'
import { FormControl, InputLabel, ListSubheader, MenuItem, Select } from '@mui/material'
import partition from 'lodash/partition'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import css from './styles.module.css'
import { type ReactElement, useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

const NetworkMenuItem = ({ chainId, chainConfigs }: { chainId: string; chainConfigs: ChainInfo[] }) => {
  const chain = useMemo(() => chainConfigs.find((chain) => chain.chainId === chainId), [chainConfigs, chainId])

  if (!chain) return null

  return (
    <MenuItem key={chainId} value={chainId} sx={{ '&:hover': { backgroundColor: 'inherit' } }}>
      <ChainIndicator chainId={chain.chainId} />
    </MenuItem>
  )
}

const NetworkInput = ({
  name,
  required = false,
  chainConfigs,
}: {
  name: string
  required?: boolean
  chainConfigs: ChainInfo[]
}): ReactElement => {
  const isDarkMode = useDarkMode()
  const theme = useTheme()
  const [testNets, prodNets] = useMemo(() => partition(chainConfigs, (config) => config.isTestnet), [chainConfigs])
  const { control } = useFormContext() || {}

  return (
    <Controller
      name={name}
      rules={{ required }}
      control={control}
      render={({ field: { ref, ...field }, fieldState: { error } }) => (
        <FormControl fullWidth>
          <InputLabel id="network-input-label">Network</InputLabel>
          <Select
            {...field}
            labelId="network-input-label"
            id="network-input"
            fullWidth
            label="Network"
            IconComponent={ExpandMoreIcon}
            renderValue={(value) => <NetworkMenuItem chainConfigs={chainConfigs} chainId={value} />}
            MenuProps={{
              sx: {
                '& .MuiPaper-root': {
                  overflow: 'auto',
                },
                ...(isDarkMode
                  ? {
                      '& .Mui-selected, & .Mui-selected:hover': {
                        backgroundColor: `${theme.palette.secondary.background} !important`,
                      },
                    }
                  : {}),
              },
            }}
          >
            {prodNets.map((chain) => (
              <NetworkMenuItem key={chain.chainId} chainConfigs={chainConfigs} chainId={chain.chainId} />
            ))}

            {testNets.length > 0 && <ListSubheader className={css.listSubHeader}>Testnets</ListSubheader>}

            {testNets.map((chain) => (
              <NetworkMenuItem key={chain.chainId} chainConfigs={chainConfigs} chainId={chain.chainId} />
            ))}
          </Select>
        </FormControl>
      )}
    />
  )
}

export default NetworkInput
