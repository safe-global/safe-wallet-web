import { type ChangeEvent, type ReactElement } from 'react'
import { Box, FormControlLabel, Switch } from '@mui/material'
import { localItem } from '@/services/local-storage/local'
import useLocalStorage from '@/services/local-storage/useLocalStorage'

const LS_KEY = 'debugProdCgw'

export const cgwDebugStorage = localItem<boolean>(LS_KEY)

const DebugToggle = (): ReactElement => {
  const [enabled, setEnabled] = useLocalStorage<boolean>(LS_KEY, false)

  const onToggle = (event: ChangeEvent<HTMLInputElement>) => {
    setEnabled(event.target.checked)

    setTimeout(() => {
      location.reload()
    }, 300)
  }

  return (
    <Box py={2} ml={2}>
      <FormControlLabel control={<Switch checked={enabled} onChange={onToggle} />} label="Use prod CGW" />
    </Box>
  )
}

export default DebugToggle
