import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Navbar() {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ocultar navbar en login/register
  if (["/login", "/register"].includes(location.pathname)) return null;

  return (
    <header className="w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="font-semibold">
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {token ? (
            <Avatar
              onClick={() => navigate("/account")}
              className="cursor-pointer"
            >
              <AvatarImage src={user?.avatarUrl || ""} alt="Avatar" />
              <AvatarFallback>
                {user?.nickname.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Button onClick={() => navigate("/login")}>Login</Button>
          )}
        </div>
      </div>
    </header>
  );
}
