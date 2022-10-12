import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/system'

// Returns true if screen width is less than 600px
// Should only be used for logic, use CSS for hiding UI elements
const useIsMobile = () => {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down('sm'))
}

export default useIsMobile
