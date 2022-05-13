import css from './styles.module.css'

export const Row = ({
  children,
  noMargin,
  className,
}: {
  children: React.ReactNode
  noMargin?: boolean
  className?: string
}) => {
  const classes = [css.row, className]
  if (noMargin) classes.push(css.noMargin)
  const classNames = classes.join(' ')

  return <div className={classNames}>{children}</div>
}
