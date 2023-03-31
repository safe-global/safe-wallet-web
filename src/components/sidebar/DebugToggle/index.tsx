import { type ChangeEvent, type ReactElement } from 'react'
import { Box, FormControlLabel, Switch } from '@mui/material'
import { localItem } from '@/services/local-storage/local'
import useLocalStorage, { type Setter } from '@/services/local-storage/useLocalStorage'
import { setDarkMode } from '@/store/settingsSlice'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useAppDispatch } from '@/store'

const LS_KEY = 'debugProdCgw'
const RELAY_SERVICE_STORAGE_KEY = 'relayService'

export const cgwDebugStorage = localItem<boolean>(LS_KEY)
export const relayServiceStorage = localItem<boolean>(RELAY_SERVICE_STORAGE_KEY)

const DebugToggle = (): ReactElement => {
  const dispatch = useAppDispatch()
  const isDarkMode = useDarkMode()

  const [isProdGateway = false, setIsProdGateway] = useLocalStorage<boolean>(LS_KEY)
  const [isProdRelayService = false, setIsProdRelayService] = useLocalStorage<boolean>(RELAY_SERVICE_STORAGE_KEY)

  const onToggle = (event: ChangeEvent<HTMLInputElement>, cb: Setter<boolean>) => {
    cb(event.target.checked)

    setTimeout(() => {
      location.reload()
    }, 300)
  }

  return (
    <Box py={2} ml={2}>
      <FormControlLabel
        control={<Switch checked={isDarkMode} onChange={(_, checked) => dispatch(setDarkMode(checked))} />}
        label="Dark mode"
      />
      <FormControlLabel
        control={<Switch checked={isProdGateway} onChange={(e) => onToggle(e, setIsProdGateway)} />}
        label="Use prod CGW"
      />
      <FormControlLabel
        control={<Switch checked={isProdRelayService} onChange={(e) => onToggle(e, setIsProdRelayService)} />}
        label="Use prod Relay Service"
      />
    </Box>
  )
}

export default DebugToggle
