import type { ControllerProps } from './useSafeController'

// Remove props added to inputs by `useController`
type WithoutRHFProps<TInputType> = Omit<TInputType, 'value' | 'error' | 'inputRef' | 'onChange' | 'onBlur'>

// Props for a custom RHF input
export type RHFInput<TInputType, TFieldValues> = WithoutRHFProps<TInputType> & ControllerProps<TFieldValues>
