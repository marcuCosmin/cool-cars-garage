import { NavLink, Outlet, type NavLinkRenderProps } from "react-router"

const navigationLinks = [
  { label: "Checks" },
  { label: "App Config", path: "/config" },
  { label: "App Auth", path: "/auth" }
]

export const ReportsLayout = () => {
  const navLinkClassName = ({ isActive }: NavLinkRenderProps) =>
    `${isActive ? "underline" : "no-underline"}`

  return (
    <>
      <ul className="w-full flex justify-center gap-5 mt-8">
        {navigationLinks.map(({ label, path = "" }, index) => {
          const to = `/reports${path}`

          return (
            <li key={index}>
              <NavLink to={to} end className={navLinkClassName}>
                {label}
              </NavLink>
            </li>
          )
        })}
      </ul>

      <Outlet />
    </>
  )
}
