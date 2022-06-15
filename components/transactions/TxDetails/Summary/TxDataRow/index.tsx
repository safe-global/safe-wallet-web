import { ReactElement, ReactNode } from 'react'
import css from './styles.module.css'

interface Props {
  children?: ReactNode
  inlineType?: 'hash' | 'rawData' | 'address' | 'bytes'
  hasExplorer?: boolean
  title: string
  value?: string | null | ReactElement
  isArray?: boolean
  method?: string
  paramType?: string
}

export const TxDataRow = ({
  children,
  inlineType,
  hasExplorer = true,
  title,
  value,
  isArray,
  method,
  paramType,
}: Props): ReactElement | null => {
  if (value == undefined) return null
  return (
    <div className={css.gridRow}>
      <span className={css.rowTitle}>{title}</span>
      {isArray && value && method && paramType && (
        <div className={css.valueWrapper}>
          {/* <Value method={method} type={paramType} value={value} /> */}
          {JSON.stringify(value)}
        </div>
      )}
      {/* {!isArray && generateInlineTypeValue(inlineType, value, hasExplorer)} */}
      {!isArray && value}
      {/* missing logic here */}
      {/* {!isArray && !inlineType && value && <span>{value}</span>} */}
      {children}
    </div>
  )
}
