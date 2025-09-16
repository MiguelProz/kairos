import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { DataTable } from "../components/DatatableGoals";

export default function DashboardPage() {
  const { token } = useAuth();
  const [goals, setGoals] = useState([] as Array<Record<string, unknown>>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/goals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "No se pudieron cargar los objetivos");
        }
        const data = await res.json();
        if (mounted) setGoals(data);
      } catch (e) {
        if (mounted) setError((e as Error).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (token) load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const inProgress = goals.filter((g) => g.status === "in_progress").length;
    const pending = goals.filter((g) => g.status === "pending").length;
    return { total, completed, inProgress, pending };
  }, [goals]);

  // DataTable ahora se alimenta del backend si no recibe props

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total objetivos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.total}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.completed}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>En progreso</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.inProgress}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.pending}
          </CardContent>
        </Card>
      </div>

      {error && <div className="text-red-500">{error}</div>}
      {loading ? <div>Cargando objetivos...</div> : <DataTable />}
    </div>
  );
}
