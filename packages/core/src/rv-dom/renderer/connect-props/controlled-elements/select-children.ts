import { CreatedChild, CreatedChildrenManager, isArray, RxO, RxSub } from '../../../../shared'

const findValue = (val: string | number) => (child: CreatedChild) =>
  child.isOption && (child.element as HTMLOptionElement).value === val + ''

const findSelected = (child: CreatedChild) =>
  child.isOption && (child.element as HTMLOptionElement).selected

const setSelected = (isSelected: boolean, child: CreatedChild) =>
  ((child.element as HTMLOptionElement).selected = isSelected)

export const controlSelectChildren = (
  selectValue: RxO<string | number | string[] | number[]>,
  createdChildren: CreatedChildrenManager
): RxSub => {
  return selectValue.subscribe(value => {
    if (createdChildren.size() > 0) {
      if (isArray(value)) {
        const arrayValue = value as Array<string | number>
        const previouslySelected = createdChildren.filter(findSelected)
        previouslySelected.forEach(child => {
          if (!arrayValue.includes((child.element as HTMLOptionElement).value)) {
            setSelected(false, child)
          }
        })
        arrayValue.forEach(selectValue => {
          if (!previouslySelected.find(findValue(selectValue))) {
            const childToSelect = createdChildren.find(findValue(selectValue))
            if (childToSelect) {
              setSelected(true, childToSelect)
            }
          }
        })
      } else {
        const childToSelect = createdChildren.find(findValue(value))
        const previouslySelected = createdChildren.find(findSelected)

        if (previouslySelected) {
          setSelected(false, previouslySelected)
        }

        if (childToSelect) {
          setSelected(true, childToSelect)
        }
      }
    }
  })
}
