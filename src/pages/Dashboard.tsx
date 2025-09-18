import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../providers/auth-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { DataTable } from "../components/DatatableGoals";
import { Badge } from "@/components/ui/badge";

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
    const archived = goals.filter((g) => g.status === "archived").length;
    return { total, completed, inProgress, pending, archived };
  }, [goals]);

  // DataTable ahora se alimenta del backend si no recibe props

  return (
    <div className="gap-6 flex flex-col w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center">
                <div className=" text-muted-foreground">Objetivos Totales</div>
                <span className="font-bold ">{stats.total}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 content-center justify-center">
              <Badge variant="secondary" className="bg-green-500 text-black">
                {stats.completed} Completados
              </Badge>
              <Badge variant="secondary" className="bg-yellow-500 text-black">
                {stats.inProgress} En progreso
              </Badge>
              <Badge variant="secondary" className="bg-blue-500 text-white">
                {stats.pending} Pendientes
              </Badge>
              <Badge variant="secondary" className="bg-gray-500 text-white">
                {stats.archived} Archivados
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && <div className="text-red-500">{error}</div>}
      {loading ? <div>Cargando objetivos...</div> : <DataTable />}
    </div>
  );
}
