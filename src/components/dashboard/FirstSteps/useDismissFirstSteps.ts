import useLocalStorage from '@/services/local-storage/useLocalStorage'

const DISMISS_FIRST_STEPS_KEY = 'dismissFirstSteps'

const useDismissFirstSteps = () => {
  const [dismissFirstSteps, setDismissFirstSteps] = useLocalStorage<boolean>(DISMISS_FIRST_STEPS_KEY)

  return { dismissFirstSteps, setDismissFirstSteps }
}

export default useDismissFirstSteps
