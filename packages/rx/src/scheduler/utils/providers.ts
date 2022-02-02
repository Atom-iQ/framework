import { TimestampProvider } from '../../types'

export const timestampProvider: TimestampProvider = {
  now() {
    return (performance || Date).now()
  }
}
