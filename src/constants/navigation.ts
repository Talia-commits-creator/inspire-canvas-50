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
      { to: "/dashboard", label: "Dashboard" },
    ],
  },
] as const;
