import type { User } from "@/globals/firestore/firestore.model"

type SimpleNavLink = {
  label: string
  href: string
  permittedRoles: User["role"][]
  type: "simple"
}

type NestedNavLink = {
  label: string
  links: SimpleNavLink[]
  type: "nested"
}

export type MainLayoutNavLinkProps = SimpleNavLink | NestedNavLink
