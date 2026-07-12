import { track } from '../core/monitor'

export const registerClickCollector = () => {
  document.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    const content = target.innerText?.trim().slice(0, 50) ?? ''

    track('behavior', 'click', 'document_click', {
      tagName: target.tagName,
      text: content,
      className: typeof target.className === 'string' ? target.className : '',
    })
  })
}
