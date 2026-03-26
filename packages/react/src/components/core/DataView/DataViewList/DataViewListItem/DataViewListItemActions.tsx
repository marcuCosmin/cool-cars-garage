import { ThreeDots } from "react-bootstrap-icons"

import { Tooltip } from "@/components/basic/Tooltip"
import { Dropdown } from "@/components/basic/Dropdown/Dropdown"
import { defaultDropdownCloseClassName } from "@/components/basic/Dropdown/Dropdown.const"

import type { DataListItemActionsConfig } from "../../DataView.model"

export const DataViewListItemActions = ({
  isDisplayedAsDropdown,
  items
}: DataListItemActionsConfig) => {
  const visibleActions = items.filter(({ hidden }) => !hidden)

  if (isDisplayedAsDropdown) {
    return (
      <Dropdown
        buttonClassName="bg-transparent p-0 w-fit text-primary"
        title={<ThreeDots width={25} height={25} />}
      >
        <ul>
          {visibleActions.map((actionConfig, index) => {
            const { tooltip, Icon, onClick } = actionConfig

            return (
              <li key={index}>
                <button
                  className={`flex items-center gap-2 bg-transparent text-primary ${defaultDropdownCloseClassName}`}
                  type="button"
                  onClick={onClick}
                >
                  <Icon width={18} height={18} />
                  <span>{tooltip}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Dropdown>
    )
  }

  return (
    <ul className="flex items-center gap-4">
      {visibleActions.map((actionConfig, index) => {
        const { tooltip, Icon, onClick } = actionConfig

        return (
          <li key={index}>
            <Tooltip
              label={tooltip}
              containerTag="button"
              containerProps={{
                onClick,
                className: "bg-transparent w-fit p-0 text-primary"
              }}
            >
              <Icon width={20} height={20} />
            </Tooltip>
          </li>
        )
      })}
    </ul>
  )
}
