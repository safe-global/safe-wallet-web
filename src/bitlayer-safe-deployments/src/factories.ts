import ProxyFactory100 from './assets/v1.0.0/proxy_factory.json'
import ProxyFactory111 from './assets/v1.1.1/proxy_factory.json'
import ProxyFactory130 from './assets/v1.3.0/proxy_factory.json'
import SafeProxyFactory141 from './assets/v1.4.1/safe_proxy_factory.json'

import { DeploymentFilter, SingletonDeployment } from './types'
import { findDeployment } from './utils'

// This is a sorted array (newest to oldest)
const factoryDeployments: SingletonDeployment[] = [
    SafeProxyFactory141, ProxyFactory130, ProxyFactory111, ProxyFactory100
]

export const getProxyFactoryDeployment = (filter?: DeploymentFilter): SingletonDeployment | undefined => {
    return findDeployment(filter, factoryDeployments)
}
