import { ReactElement, useMemo } from 'react'

const DateTime = ({
  value,
  options,
}: {
  value: string | number
  options?: any /* FIXME: DateTimeFormatOptions */
}): ReactElement => {
  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat([], options)
  }, [options])

  return <span suppressHydrationWarning>{formatter.format(new Date(value))}</span>
}

export default DateTime
