import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import * as authService from "@/services/auth.service";
import { getErrorMessage } from "@/services/api";

export function useAuth() {
  const { token, user, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authService.login(email, password),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      toast.success(`Bem-vindo, ${data.user.player?.nickname ?? data.user.email}!`);
      navigate(data.user.role === "ADMIN" ? "/" : "/", { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  function signOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === "ADMIN",
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    signOut,
  };
}
