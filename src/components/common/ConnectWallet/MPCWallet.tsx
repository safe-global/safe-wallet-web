import { Box, Button, CircularProgress } from '@mui/material'
import { useContext } from 'react'
import { MpcWalletContext } from './MPCWalletProvider'

export const MPCWallet = () => {
  const { loginPending, triggerLogin, resetAccount, userInfo } = useContext(MpcWalletContext)

  return (
    <>
      {userInfo.email ? (
        <>
          <Box display="flex" flexDirection="row" gap={2}>
            <span>
              <Button variant="contained" color="error" size="small" onClick={resetAccount}>
                Reset
              </Button>
            </span>
          </Box>
        </>
      ) : (
        <Button variant="contained" onClick={triggerLogin} disabled={loginPending}>
          {loginPending ? (
            <>
              Login Pending <CircularProgress sx={{ ml: 1 }} size={20} />
            </>
          ) : (
            'Login with Socials'
          )}
        </Button>
      )}
    </>
  )
}
