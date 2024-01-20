import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setshowOnlyTrustedTransactions } from '@/store/settingsSlice'
import madProps from '@/utils/mad-props'
import _TrustedToggleButton from './TrustedToggleButton'

const useOnlyTrusted = () => {
  const userSettings = useAppSelector(selectSettings)
  return userSettings.showOnlyTrustedTransactions || false
}

const useSetOnlyTrusted = () => {
  const dispatch = useAppDispatch()
  return (isOn: boolean) => {
    dispatch(setshowOnlyTrustedTransactions(isOn))
  }
}

const TrustedToggle = madProps(_TrustedToggleButton, {
  onlyTrusted: useOnlyTrusted,
  setOnlyTrusted: useSetOnlyTrusted,
})

export default TrustedToggle
