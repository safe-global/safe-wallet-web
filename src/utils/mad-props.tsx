import React, { ComponentType, FC, useEffect, useState } from 'react'

type SinglePropHook<T> = () => T
type HookMap<P> = {
  [K in keyof P]?: SinglePropHook<P[K]>
}

const madProps = <P extends Record<string, unknown>, H extends keyof P>(
  Component: ComponentType<P>,
  useHook: SinglePropHook<Pick<P, H>> | HookMap<Pick<P, H>>,
): FC<Omit<P, H>> => {
  return (externalProps: Omit<P, H>) => {
    const [computedProps, setComputedProps] = useState<P>({ ...(externalProps as P) })

    useEffect(() => {
      let newProps: P = { ...computedProps }

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

      setComputedProps(newProps)
    }, [externalProps, useHook])

    return <Component {...computedProps} />
  }
}

export default madProps
