import { CreatedChild, CreatedChildrenManager, isArray, RxO, RxSub } from '../../../../shared'

export const controlSelectChildren = (
  selectValue: RxO<string | number | string[] | number[]>,
  createdChildren: CreatedChildrenManager
): RxSub => {
  return selectValue.subscribe(value => {
    if (createdChildren.size() > 0) {
      if (isArray(value)) {
        const previouslySelected = createdChildren.filter(
          child => child.isOption && (child.element as HTMLOptionElement).selected
        )

        const findValue = (val: string) => (child: CreatedChild) =>
          child.isOption && (child.element as HTMLOptionElement).value === val

        const childrenToSelect = (value as Array<string | number>).reduce((toSelect, val) => {
          val = val + ''
          if (!previouslySelected.find(findValue(val))) {
            const childToSelect = createdChildren.find(findValue(val))
            return childToSelect ? toSelect.concat(childToSelect) : toSelect
          }
          return toSelect
        }, [])

        const childrenToUnselect = previouslySelected.filter(
          child =>
            !(value as Array<string | number>).includes((child.element as HTMLOptionElement).value)
        )

        childrenToUnselect.forEach(child => ((child.element as HTMLOptionElement).selected = false))

        childrenToSelect.forEach(child => ((child.element as HTMLOptionElement).selected = true))
      } else {
        const childToSelect = createdChildren.find(
          child => child.isOption && (child.element as HTMLOptionElement).value === value + ''
        )
        const previouslySelected = createdChildren.find(
          child => child.isOption && (child.element as HTMLOptionElement).selected
        )

        if (previouslySelected) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(previouslySelected.element as HTMLOptionElement).selected = false
        }

        if (childToSelect) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(childToSelect.element as HTMLOptionElement).selected = true
        }
      }
    }
  })
}
