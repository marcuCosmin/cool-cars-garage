import { NavLink, useLocation, type NavLinkRenderProps } from "react-router"

import { useAppSelector } from "@/redux/redux.config"

import { Dropdown } from "@/components/basic/Dropdown/Dropdown"
import { defaultDropdownCloseClassName } from "@/components/basic/Dropdown/Dropdown.const"

import { mergeClassNames } from "@/utils/mergeClassNames"

import type { NavLinkConfig } from "./MainLayout.model"

type MainLayoutNavLinkProps = NavLinkConfig & {
  isNested?: boolean
}

export const MainLayoutNavLink = (props: MainLayoutNavLinkProps) => {
  const { pathname } = useLocation()
  const userRole = useAppSelector(state => state.user.role)

  if (props.type === "simple") {
    const { label, href, permittedRoles, isNested } = props

    if (!permittedRoles.includes(userRole)) {
      return null
    }

    const getNavLinkClassName = ({ isActive }: NavLinkRenderProps) =>
      mergeClassNames(
        `text-white ${isActive ? "underline" : "no-underline"}`,
        isNested && defaultDropdownCloseClassName
      )

    return (
      <NavLink key={href} className={getNavLinkClassName} to={href} end>
        {label}
      </NavLink>
    )
  }

  const { label, links } = props

  const hasActiveLink = links.some(link => pathname === link.href)

  const title = (
    <span className={hasActiveLink ? "underline" : ""}>{label}</span>
  )

  return (
    <Dropdown title={title} key={label} buttonClassName="link-button p-0">
      {links.map(link => (
        <MainLayoutNavLink key={link.href} {...link} isNested />
      ))}
    </Dropdown>
  )
}
