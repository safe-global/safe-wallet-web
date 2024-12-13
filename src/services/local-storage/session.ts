import Storage from './Storage'

const session = new Storage(typeof window !== 'undefined' ? window.sessionStorage : undefined)

export default session
