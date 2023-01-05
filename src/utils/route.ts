import { AppRoutes } from '@/config/routes'
import type { ParsedUrlQuery } from 'querystring'

export const isIndexRoute = (pathname: string): boolean => {
  return pathname === AppRoutes.index
}

export const isNewSafeRoute = (pathname: string): boolean => {
  return pathname === AppRoutes.newSafe.create
}

export const isWelcomeRoute = (pathname: string): boolean => {
  return pathname === AppRoutes.welcome
}

export const isLoadSafeRoute = (pathname: string): boolean => {
  return pathname === AppRoutes.newSafe.load
}

export const isAppShareRoute = (pathname: string): boolean => {
  return pathname === AppRoutes.share.safeApp
}

export const isSafeAppRoute = (pathname: string, query: ParsedUrlQuery): boolean => {
  return pathname === AppRoutes.apps && !!query.appUrl
}
