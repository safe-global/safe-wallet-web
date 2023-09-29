import type { ComponentType, FC } from 'react'

type SinglePropHook<T> = () => T
type HookMap<P> = {
  [K in keyof P]?: SinglePropHook<P[K]>
}

const MadProps = <P extends Record<string, unknown>, H extends keyof P>(
  Component: ComponentType<P>,
  useHook: SinglePropHook<Pick<P, H>> | HookMap<Pick<P, H>>,
): FC<Omit<P, H>> => {
  const madComponent = (externalProps: Omit<P, H>) => {
    let newProps: P = { ...externalProps } as P

    if (typeof useHook === 'function') {
      newProps = { ...newProps, ...useHook() } as P
    } else {
      for (const key in useHook) {
        const hook = useHook[key]
        if (hook !== undefined) {
          newProps[key as H] = hook()
        }
      }
    }

    return <Component {...newProps} />
  }

  madComponent.displayName = Component.displayName || Component.name

  return madComponent
}

export default MadProps
