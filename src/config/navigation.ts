export type NavigationItem = {
  name: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
};

export const navigationItems: NavigationItem[] = [
  {
    name: "Home",
    href: "/",
    icon: "home",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    requiresAuth: true,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: "user",
    requiresAuth: true,
  },
];

export const authNavigationItems: NavigationItem[] = [
  {
    name: "Login",
    href: "/login",
    icon: "login",
  },
  {
    name: "Sign Up",
    href: "/signup",
    icon: "user-plus",
  },
];
