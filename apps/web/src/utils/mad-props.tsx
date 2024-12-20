import type { ComponentType, FC } from 'react'
import React, { memo } from 'react'

type HookMap<P> = {
  [K in keyof P]?: () => P[K]
}

/**
 * Injects props into a component using hooks.
 * This allows to keep the original component pure and testable.
 *
 * @param Component The component to wrap
 * @param hookMap A map of hooks to use, keys are the props to inject, values are the hooks
 * @returns A new component with the props injected
 */
const madProps = <P extends Record<string, unknown>, H extends keyof P>(
  Component: ComponentType<P>,
  hookMap: HookMap<Pick<P, H>>,
): FC<Omit<P, H>> => {
  const MadComponent = (externalProps: Omit<P, H>) => {
    let newProps: P = { ...externalProps } as P

    for (const key in hookMap) {
      const hook = hookMap[key]
      if (hook !== undefined) {
        newProps[key as H] = hook()
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
