import type { User } from "@/globals/firestore/firestore.model"

type SimpleNavLinkConfig = {
  label: string
  href: string
  permittedRoles: User["role"][]
  type: "simple"
}

type NestedNavLinkConfig = {
  label: string
  links: SimpleNavLinkConfig[]
  type: "nested"
}

export type NavLinkConfig = SimpleNavLinkConfig | NestedNavLinkConfig
