import { emitMonitorBusEvent } from '../core/event-bus'

export const registerClickCollector = () => {
  document.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof Element)) {
      return
    }

    emitMonitorBusEvent('dom:click', { target })
  })
}
