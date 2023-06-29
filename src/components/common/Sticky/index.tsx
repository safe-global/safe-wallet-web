import { Box } from '@mui/material'
import type { ReactElement } from 'react'

const stickyTop = { xs: '103px', md: '111px' }
export const Sticky = ({ children }: { children: ReactElement }): ReactElement => (
  <Box position="sticky" zIndex="1" top={stickyTop} py={1} bgcolor="background.main" mt={-1} mb={1}>
    {children}
  </Box>
)
