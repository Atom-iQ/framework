export const dispatchMouseEvent = (target: EventTarget): void => {
  const mockEvent = document.createEvent('MouseEvent')

  mockEvent.initMouseEvent(
    'click',
    true,
    true,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    target
  )
  target.dispatchEvent(mockEvent)
}

export const dispatchInputEvent = (target: HTMLInputElement | HTMLTextAreaElement): void => {
  const mockEvent = new InputEvent('input', { bubbles: true, cancelable: true })
  target.dispatchEvent(mockEvent)
}

export const dispatchChangeEvent = (target: HTMLInputElement | HTMLSelectElement): void => {
  const mockEvent = new Event('change')
  target.dispatchEvent(mockEvent)
}
