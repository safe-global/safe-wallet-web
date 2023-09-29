import type { ComponentType, FC } from 'react'
import React, { memo } from 'react'

type SinglePropHook<T> = () => T
type HookMap<P> = {
  [K in keyof P]?: SinglePropHook<P[K]>
}

const madProps = <P extends Record<string, unknown>, H extends keyof P>(
  Component: ComponentType<P>,
  useHook: SinglePropHook<Pick<P, H>> | HookMap<Pick<P, H>>,
): FC<Omit<P, H>> => {
  const MadComponent = (externalProps: Omit<P, H>) => {
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

  MadComponent.displayName = Component.displayName || Component.name

  // Wrapping MadComponent with React.memo and casting to FC<Omit<P, H>>
  // The casting is only needed because of memo, the component itself satisfies the type
  return memo(MadComponent) as unknown as FC<Omit<P, H>>
}

export default madProps
