import { useEffect, useState } from "react";
import { useAuth } from "../auth";
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

export default function AccountPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { token, user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.name) setName(user.name);
    if (user?.nickname) setNickname(user.nickname);
    if (user?.bio !== undefined) setBio(user.bio || "");
    if (user?.avatarUrl !== undefined) setAvatarUrl(user.avatarUrl || "");
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          name,
          nickname,
          bio,
          avatarUrl,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo guardar");
        return;
      }
      setMessage("Datos actualizados");
      setCurrentPassword("");
      setNewPassword("");
      // refrescamos el usuario del contexto pidiendo /me con el mismo token
      try {
        const me = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (me.ok) {
          // Reutilizamos login para rehidratar el user (login vuelve a hacer /me y setea user)
          // Alternativamente, podríamos exponer un método refresh en el contexto.
          login(token!);
        }
      } catch {
        // ignoramos errores de refresco aquí
      }
    } catch {
      setError("Error de red o servidor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Mi cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}
                  {message && (
                    <div className="text-green-600 text-sm text-center">
                      {message}
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={saving}>
                      {saving ? "Guardando..." : "Guardar cambios"}
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
