import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ListTodo } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, nickname, bio }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error desconocido");
        setLoading(false);
        return;
      }
      navigate("/login", { replace: true });
    } catch {
      setError("Error de red o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <ListTodo className="size-4" />
          </div>
          KAIROS
        </a>
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Crear cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Tu nombre"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                      id="nickname"
                      placeholder="usuario123"
                      required
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="bio">Bio (opcional)</Label>
                    <Input
                      id="bio"
                      placeholder="Cuéntanos algo de ti"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="confirmPassword">Repetir contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Registrando..." : "Registrarse"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/login")}
                      disabled={loading}
                    >
                      ¿Ya tienes cuenta? Inicia sesión
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
