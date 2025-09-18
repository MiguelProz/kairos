import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

import React from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Cerrar menú al navegar
  React.useEffect(() => {
    // El menú del avatar ahora lo controla el DropdownMenu, no es necesario cerrar manualmente
  }, [location.pathname]);

  // Ocultar navbar en login/register
  if (["/login", "/register"].includes(location.pathname)) return null;

  return (
    <header className="sticky top-0 z-40 w-full text-white shadow-sm bg-black/50 backdrop-blur">
      <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-2 sm:px-4">
        {/* Logo, nombre y versión */}
        <div className="flex items-center gap-2 truncate max-w-[180px] min-w-0">
          <Avatar className="size-7 bg-white/10">
            <AvatarImage
              src="/favicon.svg"
              alt="Logo"
              style={{ filter: "invert(1)" }}
            />
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-xl font-semibold tracking-tight truncate">
              Kairos
            </span>
          </div>
        </div>

        {/* Menú hamburguesa en móvil */}
        <div className="flex-1 flex items-center sm:justify-center justify-start">
          <nav className="">
            <NavigationMenu className="bg-transparent">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/dashboard"
                      className="px-4 py-2 rounded-md hover:bg-white/10 transition-colors font-medium text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      Dashboard
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>

        {/* GitHub y Usuario / Login */}
        <div className="flex items-center gap-2 min-w-0 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer border-2 border-white/20 hover:border-primary transition-all">
                <AvatarImage src={user?.avatarUrl || ""} alt="Avatar" />
                <AvatarFallback>
                  {user?.nickname?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2 text-xs text-muted-foreground select-none">
                <span className="block font-semibold text-white">Kairos</span>
                <span className="block">v{__APP_VERSION__}</span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/account")}>
                Cuenta
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://github.com/MiguelProz/kairos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <span>GitHub</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                variant="destructive"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
