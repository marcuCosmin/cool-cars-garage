import { NavLink, useLocation } from "react-router"

import { useAppSelector } from "@/redux/redux.config"

import { Dropdown } from "@/components/basic/Dropdown"

import { getNavLinkClassName } from "./MainLayout.utils"

import type { MainLayoutNavLinkProps } from "./MainLayout.model"

export const MainLayoutNavLink = (props: MainLayoutNavLinkProps) => {
  const { pathname } = useLocation()
  const userRole = useAppSelector(state => state.user.role)

  if (props.type === "simple") {
    const { label, href, permittedRoles } = props

    if (!permittedRoles.includes(userRole)) {
      return null
    }

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
        <MainLayoutNavLink key={link.href} {...link} />
      ))}
    </Dropdown>
  )
}
