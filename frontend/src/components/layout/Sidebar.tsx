import { NavLink } from "react-router-dom";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { adminLinks, playerLinks } from "./navLinks";

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const links = user?.role === "ADMIN" ? adminLinks : playerLinks;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-overall text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Patota Barbearia</p>
          <p className="text-xs font-semibold leading-tight text-primary">BECKER</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                isActive && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
              )
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-border/60 bg-secondary/40 p-3 text-xs text-muted-foreground">
        Toda quinta é dia de jogo. Confirme sua presença!
      </div>
    </aside>
  );
}
