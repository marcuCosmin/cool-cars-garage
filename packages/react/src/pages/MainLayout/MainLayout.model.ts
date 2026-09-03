type SimpleNavLinkConfig = {
  label: string
  href: string
  type: "simple"
}

type NestedNavLinkConfig = {
  label: string
  links: SimpleNavLinkConfig[]
  type: "nested"
}

export type NavLinkConfig = SimpleNavLinkConfig | NestedNavLinkConfig
