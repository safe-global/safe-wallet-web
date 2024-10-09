import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../index'

// It's recommended to extend the default redux hooks
// https://redux-toolkit.js.org/tutorials/typescript#define-typed-hooks
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
