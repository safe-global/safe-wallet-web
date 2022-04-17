import { ReactElement, useMemo } from 'react'
import useBrowserLocale from 'services/useBrowserLocale'

const DateTime = ({
  value,
  options,
}: {
  value: string | number
  options?: any /* FIXME: DateTimeFormatOptions */
}): ReactElement => {
  const locale = useBrowserLocale()

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, options)
  }, [locale, options])

  return <>{formatter.format(new Date(value))}</>
}

export default DateTime
