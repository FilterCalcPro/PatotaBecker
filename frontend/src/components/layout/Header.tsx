import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { adminLinks, playerLinks } from "./navLinks";
import { useAuthStore } from "@/store/auth.store";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/utils";
import * as notificationsService from "@/services/notifications.service";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/jogadores": "Jogadores",
  "/convidados": "Convidados",
  "/fila-espera": "Fila de Espera",
  "/jogos": "Jogos",
  "/caixa": "Caixa",
  "/rankings": "Rankings",
  "/tv": "Painel TV",
};

export function Header() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const links = user?.role === "ADMIN" ? adminLinks : playerLinks;

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsService.listNotifications,
    enabled: !!user?.player,
    refetchInterval: 60_000,
  });
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  const title = PAGE_TITLES[location.pathname] ?? "Patota Becker";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 top-16 z-40 w-full border-b border-border bg-background p-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary",
                    isActive && "bg-primary/10 text-primary"
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <div className="flex items-center gap-2">
        {user?.player && (
          <div className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </div>
        )}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-secondary">
              <Avatar className="h-8 w-8">
                {user?.player?.photoUrl && <AvatarImage src={user.player.photoUrl} />}
                <AvatarFallback>{initials(user?.player?.nickname ?? user?.email ?? "?")}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user?.player?.nickname ?? "Admin"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
