import type { User } from "@/globals/firestore/firestore.model"

import type { NavLinkConfig } from "./MainLayout.model"

export const navLinksByRole: Record<User["role"], NavLinkConfig[]> = {
  admin: [
    {
      label: "Cars",
      href: "/cars",
      type: "simple"
    },
    {
      label: "Users",
      href: "/users",
      type: "simple"
    },
    {
      label: "Reports",
      type: "nested",
      links: [
        {
          label: "Checks",
          href: "/reports",
          type: "simple"
        },
        {
          label: "Questions Config",
          href: "/reports/config",
          type: "simple"
        },
        {
          label: "Mobile App",
          href: "/reports/auth",
          type: "simple"
        }
      ]
    }
  ],
  manager: [
    {
      label: "Questions Config",
      href: "/reports/config",
      type: "simple"
    }
  ],
  driver: [],
  mechanic: []
}
