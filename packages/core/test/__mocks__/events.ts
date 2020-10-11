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
