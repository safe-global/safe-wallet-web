import { Box, SvgIcon, Typography } from '@mui/material'
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation'
import useGasPrice from '@/hooks/useGasPrice'
import { formatVisualAmount } from '@/utils/formatters'

const GasStation = () => {
  const [gasPrice] = useGasPrice()
  const maxFeePerGas = gasPrice?.maxFeePerGas
  const gasGwei = maxFeePerGas ? formatVisualAmount(maxFeePerGas, 'gwei', 0) : ''

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Typography minWidth={gasGwei.length * 0.75 + 'em'} fontWeight="bold">
        {gasGwei}
      </Typography>
      <SvgIcon component={LocalGasStationIcon} inheritViewBox fontSize="small" />
    </Box>
  )
}

export default GasStation
