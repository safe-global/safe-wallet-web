import { useDarkMode } from '@/hooks/useDarkMode'
import { localItem } from '@/services/local-storage/local'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useAppDispatch } from '@/store'
import { setDarkMode } from '@/store/settingsSlice'
import { Box, FormControlLabel, Switch } from '@mui/material'
import { type ChangeEvent, type ReactElement } from 'react'

const LS_KEY = 'debugProdCgw'

export const cgwDebugStorage = localItem<boolean>(LS_KEY)

const DebugToggle = (): ReactElement => {
  const dispatch = useAppDispatch()
  const isDarkMode = useDarkMode()

  const [isProdGateway = false, setIsProdGateway] = useLocalStorage<boolean>(LS_KEY)

  const onToggleGateway = (event: ChangeEvent<HTMLInputElement>) => {
    setIsProdGateway(event.target.checked)

    setTimeout(() => {
      location.reload()
    }, 300)
  }

  return (
    <Box data-sid="40162" py={2} ml={2}>
      <FormControlLabel
        control={<Switch checked={isDarkMode} onChange={(_, checked) => dispatch(setDarkMode(checked))} />}
        label="Dark mode"
      />
      <FormControlLabel control={<Switch checked={isProdGateway} onChange={onToggleGateway} />} label="Use prod CGW" />
    </Box>
  )
}

export default DebugToggle
