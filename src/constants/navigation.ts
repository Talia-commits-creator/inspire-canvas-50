export const SITE = {
  name: "Inspire to Aspire",
  short: "I2A",
  tagline: "Connecting Talent. Creating Opportunities. Inspiring Communities.",
} as const;

export const PRIMARY_NAV = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/creators", label: "Creators" },
  { to: "/organizations", label: "Organizations" },
  { to: "/projects", label: "Projects" },
  { to: "/community", label: "Community" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

/* Mobile keeps only the highest-value destinations */
export const MOBILE_NAV = [
  { to: "/discover", label: "Discover" },
  { to: "/creators", label: "Creators" },
  { to: "/projects", label: "Projects" },
  { to: "/community", label: "Community" },
  { to: "/about", label: "About" },
] as const;

export const FOOTER_GROUPS = [
  {
    title: "Platform",
    links: [
      { to: "/discover", label: "Discover" },
      { to: "/creators", label: "Creators" },
      { to: "/organizations", label: "Organizations" },
      { to: "/projects", label: "Projects" },
    ],
  },
  {
    title: "Community",
    links: [
      { to: "/community", label: "Community" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" },
      { to: "/forgot-password", label: "Reset password" },
      { to: "/dashboard", label: "Dashboard" },
    ],
  },
] as const;
