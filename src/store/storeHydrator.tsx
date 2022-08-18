import React from 'react'
import { Provider } from 'react-redux'
import type { Store } from 'redux'

import { getPersistedState, RootState } from '@/store'

export const HYDRATE_ACTION = '@@HYDRATE'

type Props = { children: React.ReactElement | React.ReactElement[] }

export const createStoreHydrator = (makeStore: () => Store<RootState>) => {
  return class HydrationWrapper extends React.Component<Props> {
    private store: ReturnType<typeof makeStore>

    constructor(props: Props) {
      super(props)

      this.store = makeStore()
    }

    componentDidMount() {
      this.store.dispatch({
        type: HYDRATE_ACTION,
        payload: getPersistedState(),
      })
    }

    render() {
      return <Provider store={this.store}>{this.props.children}</Provider>
    }
  }
}
