import type { NavLinkConfig } from "./MainLayout.model"

export const navLinks: NavLinkConfig[] = [
  {
    label: "Cars",
    href: "/cars",
    permittedRoles: ["admin"],
    type: "simple"
  },
  {
    label: "Users",
    href: "/users",
    permittedRoles: ["admin"],
    type: "simple"
  },
  {
    label: "Reports",
    type: "nested",
    links: [
      {
        label: "Checks",
        href: "/reports",
        permittedRoles: ["admin", "manager"],
        type: "simple"
      },
      {
        label: "Questions Config",
        href: "/reports/config",
        permittedRoles: ["admin"],
        type: "simple"
      },
      {
        label: "Mobile App",
        href: "/reports/auth",
        permittedRoles: ["driver", "admin"],
        type: "simple"
      }
    ]
  }
]
