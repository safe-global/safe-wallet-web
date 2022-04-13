import { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '../store'
import useChains from 'services/useChains'
import useSafeInfo from 'services/useSafeInfo'
import '../styles/globals.css'

const Consumer = ({ children }: { children: ReactElement }): ReactElement => {
  useChains()
  useSafeInfo()

  return children
}

function SafeWebCore({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Consumer>
        <Component {...pageProps} />
      </Consumer>
    </Provider>
  )
}

export default SafeWebCore
