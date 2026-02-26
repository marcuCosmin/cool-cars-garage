import { type NavLinkRenderProps } from "react-router"

export const getNavLinkClassName = ({ isActive }: NavLinkRenderProps) =>
  `text-white ${isActive ? "underline" : "no-underline"}`
