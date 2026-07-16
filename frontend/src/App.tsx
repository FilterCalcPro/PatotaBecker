import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useThemeStore } from "@/store/theme.store";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PlayersList from "@/pages/players/PlayersList";
import PlayerProfile from "@/pages/players/PlayerProfile";
import GuestsList from "@/pages/guests/GuestsList";
import WaitlistPage from "@/pages/waitlist/WaitlistPage";
import MatchesList from "@/pages/matches/MatchesList";
import MatchDetail from "@/pages/matches/MatchDetail";
import RankingsPage from "@/pages/rankings/RankingsPage";
import CashFlow from "@/pages/finance/CashFlow";
import TVPanel from "@/pages/tv/TVPanel";

export default function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/tv" element={<TVPanel />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jogadores" element={<PlayersList />} />
          <Route path="/jogadores/:id" element={<PlayerProfile />} />

          <Route path="/jogos" element={<MatchesList />} />
          <Route path="/jogos/:id" element={<MatchDetail />} />
          <Route path="/rankings" element={<RankingsPage />} />

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/convidados" element={<GuestsList />} />
            <Route path="/fila-espera" element={<WaitlistPage />} />
            <Route path="/caixa" element={<CashFlow />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
