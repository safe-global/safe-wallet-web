interface GeneralEventTypes {
  // the name of the event and the data it dispatches with
  // e.g. 'entryCreated': { count: 1 }
  [eventType: string]: Record<string, unknown>
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
