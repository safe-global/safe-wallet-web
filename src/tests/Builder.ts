export interface IBuilder<T> {
  with<K extends keyof T>(key: K, value: T[K]): IBuilder<T>

  build(): T
}

export class Builder<T> implements IBuilder<T> {
  private constructor(private target: Partial<T>) {}

  /**
   * Returns a new {@link Builder} with the property {@link key} set to {@link value}.
   *
   * @param key - the name of the property from T to be set
   * @param value - the value of the property from T to be set
   */
  with<K extends keyof T>(key: K, value: T[K]): IBuilder<T> {
    const target: Partial<T> = { ...this.target, [key]: value }
    return new Builder<T>(target)
  }

  /**
   * Returns an instance of T with the values that were set so far
   */
  build(): T {
    return this.target as T
  }

  public static new<T>(): IBuilder<T> {
    return new Builder<T>({})
  }
}
