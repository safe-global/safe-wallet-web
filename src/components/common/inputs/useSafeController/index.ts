import { useController } from 'react-hook-form'
import type { UseControllerProps, FieldValues } from 'react-hook-form'
import type { ReactNode } from 'react'

type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property]
}

// `useController` props, with a required `control`
// If we want to use a context, this need not be required
export type ControllerProps<TFieldValues> = WithRequiredProperty<UseControllerProps<TFieldValues>, 'control'>

export const useSafeController = <TFieldValues extends FieldValues>({
  rules,
  label,
  ...props
}: ControllerProps<TFieldValues> & { required?: boolean; label?: ReactNode }) => {
  const required = props.required || !!rules?.required

  const {
    field,
    fieldState: { error },
  } = useController({
    rules: { required, ...rules },
    ...props,
  })

  return { field, error, required, label: error?.message || label }
}
