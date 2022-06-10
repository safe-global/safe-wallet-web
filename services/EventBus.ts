interface GeneralEventTypes {
  [eventType: string]: any
}

class EventBus<EventTypes extends GeneralEventTypes> {
  private eventTarget: EventTarget

  constructor() {
    this.eventTarget = new EventTarget()
  }

  dispatch<T extends string>(eventType: T, detail: EventTypes[T]): void {
    const e = new CustomEvent(eventType, { detail })
    this.eventTarget.dispatchEvent(e)
  }

  subscribe<T extends string>(eventType: T, callback: (detail: EventTypes[T]) => void): () => void {
    const handler = (e: Event) => {
      if (e instanceof CustomEvent) {
        callback(e.detail)
      }
    }

    this.eventTarget.addEventListener(eventType, handler)

    // Return an unsubscribe function
    return () => this.eventTarget.removeEventListener(eventType, handler)
  }
}

export default EventBus
