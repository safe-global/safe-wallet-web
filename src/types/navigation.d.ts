// navigation.d.ts

export interface Screens {}

export declare global {
  namespace ReactNavigation {
    interface RootParamList extends Screens {
      settings: { safeAddress?: string }
    }
  }
}
