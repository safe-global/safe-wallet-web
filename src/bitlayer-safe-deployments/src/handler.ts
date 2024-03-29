import DefaultCallbackHandler130 from './assets/v1.1.1/default_callback_handler.json'
import CompatibilityFallbackHandler130 from './assets/v1.3.0/compatibility_fallback_handler.json'
import CompatibilityFallbackHandler141 from './assets/v1.4.1/compatibility_fallback_handler.json'
import { DeploymentFilter, SingletonDeployment } from './types'
import { findDeployment } from './utils'

// This is a sorted array (by preference)
const defaultCallbackHandlerDeployments: SingletonDeployment[] = [
  DefaultCallbackHandler130
]

export const getDefaultCallbackHandlerDeployment = (filter?: DeploymentFilter): SingletonDeployment | undefined => {
    return findDeployment(filter, defaultCallbackHandlerDeployments)
}

// This is a sorted array (by preference)
const compatFallbackHandlerDeployments: SingletonDeployment[] = [
  CompatibilityFallbackHandler141, CompatibilityFallbackHandler130
]

export const getCompatibilityFallbackHandlerDeployment = (filter?: DeploymentFilter): SingletonDeployment | undefined => {
    return findDeployment(filter, compatFallbackHandlerDeployments)
}

// This is a sorted array (by preference)
const fallbackHandlerDeployments: SingletonDeployment[] = [
  CompatibilityFallbackHandler141,  CompatibilityFallbackHandler130, DefaultCallbackHandler130
]

export const getFallbackHandlerDeployment = (filter?: DeploymentFilter): SingletonDeployment | undefined => {
    return findDeployment(filter, fallbackHandlerDeployments)
}
