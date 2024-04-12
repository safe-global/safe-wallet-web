import '@stakekit/widget/package/css'
import { SKApp, darkTheme, lightTheme } from '@stakekit/widget'
import { useDarkMode } from '../../hooks/useDarkMode'
import css from './styles.module.css'
import PageHeader from '../common/PageHeader'
import { useSKProvider } from './use-sk-provider'

export const Widget = () => {
  const darkMode = useDarkMode()

  const providerParams = useSKProvider()

  if (!providerParams) return null

  return (
    <div className={css.widgetRoot}>
      <PageHeader title="Stake" noBorder />

      <main className={css.widgetMain}>
        <SKApp theme={darkMode ? darkTheme : lightTheme} {...providerParams} disableGasCheck />
      </main>
    </div>
  )
}
