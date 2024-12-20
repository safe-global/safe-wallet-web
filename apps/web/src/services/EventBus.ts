interface GeneralEventTypes {
  // the name of the event and the data it dispatches with
  // e.g. 'entryCreated': { count: 1 }
  [eventType: string]: any
}

class EventBus<EventTypes extends GeneralEventTypes> {
  private eventTarget: EventTarget

  constructor() {
    this.eventTarget = new EventTarget()
  }

  dispatch<T extends keyof EventTypes>(eventType: T, detail: EventTypes[T]): void {
    const e = new CustomEvent(String(eventType), { detail })
    this.eventTarget.dispatchEvent(e)
  }

  subscribe<T extends keyof EventTypes>(eventType: T, callback: (detail: EventTypes[T]) => void): () => void {
    const handler = (e: Event) => {
      if (e instanceof CustomEvent) {
        callback(e.detail)
      }
    }

    const eventName = String(eventType)

    this.eventTarget.addEventListener(eventName, handler)

    // Return an unsubscribe function
    return () => this.eventTarget.removeEventListener(eventName, handler)
  }
}

export default EventBus
