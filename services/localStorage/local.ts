import Storage from './Storage'

const local = new Storage(typeof window !== 'undefined' ? window.localStorage : undefined)

export default local
