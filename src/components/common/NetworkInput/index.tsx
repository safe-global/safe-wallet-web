import ChainIndicator from '@/components/common/ChainIndicator'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useTheme } from '@mui/material/styles'
import { FormControl, InputLabel, ListSubheader, MenuItem, Select } from '@mui/material'
import partition from 'lodash/partition'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import css from './styles.module.css'
import { type ReactElement, useCallback, useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

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

  const renderMenuItem = useCallback(
    (chainId: string, isSelected: boolean) => {
      const chain = chainConfigs.find((chain) => chain.chainId === chainId)
      if (!chain) return null
      return (
        <MenuItem key={chainId} value={chainId} sx={{ '&:hover': { backgroundColor: 'inherit' } }}>
          <ChainIndicator chainId={chain.chainId} />
        </MenuItem>
      )
    },
    [chainConfigs],
  )

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
            renderValue={(value) => renderMenuItem(value, true)}
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
            {prodNets.map((chain) => renderMenuItem(chain.chainId, false))}

            {testNets.length > 0 && <ListSubheader className={css.listSubHeader}>Testnets</ListSubheader>}

            {testNets.map((chain) => renderMenuItem(chain.chainId, false))}
          </Select>
        </FormControl>
      )}
    />
  )
}

export default NetworkInput
