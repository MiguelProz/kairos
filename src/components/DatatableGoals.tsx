import * as React from "react";
import { type DatatableRow } from "./DatatableGoals.schema";
import { useAuth } from "@/providers/auth-provider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  SwipeableList,
  SwipeableListItem,
  LeadingActions,
  TrailingActions,
  SwipeAction,
  Type as ListType,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import { Tabs } from "@/components/ui/tabs";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import AddGoalDrawer from "./GoalDrawer";
import { Goal } from "@/types/goal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

export function DataTable({ data: initialData }: { data?: DatatableRow[] }) {
  // Estado para mostrar/ocultar filtros
  const [showFilters, setShowFilters] = React.useState(false);
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [data, setData] = React.useState<DatatableRow[]>(
    () => initialData ?? []
  );
  // Filtros y orden
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  // Estado para edición
  const [editGoal, setEditGoal] = React.useState<Goal | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  // Estado para eliminar
  const [deleteGoalId, setDeleteGoalId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Mostrar diálogo y evitar swipe
  const handleDeleteDialog = (
    goalId: string,
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    if (e && e.preventDefault) e.preventDefault();
    setDeleteGoalId(goalId);
    setDialogOpen(true);
  };
  // Cargar datos completos para edición
  const handleEdit = async (item: DatatableRow) => {
    if (!item.goalId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/goals/${item.goalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar el objetivo");
      const goal: Goal = await res.json();
      setEditGoal(goal);
      setDrawerOpen(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  // Eliminar objetivo
  const handleDelete = async () => {
    if (!deleteGoalId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/goals/${deleteGoalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo eliminar el objetivo");
      setData((prev) => prev.filter((row) => row.goalId !== deleteGoalId));
      setDeleteGoalId(null);
      setDialogOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  // ...existing code...

  // Utilidades para mapear Goals del backend al esquema de la tabla
  const mapGoalToRow = React.useCallback(
    (g: Goal, idx: number): DatatableRow => ({
      id: idx + 1,
      goalId: g._id,
      description: g.description || "",
      title: g.title,
      category: g.category || "-",
      status: g.status,
      priority: g.priority,
      progress: Math.round(g.progress ?? 0),
      dueDate: g.dueDate,
      createdAt: g.createdAt,
    }),
    []
  );

  const mapGoalsToRows = React.useCallback(
    (goals: Goal[]): DatatableRow[] =>
      goals.map((g, idx) => mapGoalToRow(g, idx)),
    [mapGoalToRow]
  );

  // Cargar del backend si no se proporcionaron datos
  React.useEffect(() => {
    const hasInitial = Array.isArray(initialData) && initialData.length > 0;
    if (hasInitial || !token) return;
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/goals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "No se pudieron cargar los objetivos");
        }
        const goals: Goal[] = await res.json();
        if (!mounted) return;
        setData(mapGoalsToRows(goals));
      } catch (e) {
        if (!mounted) return;
        setError((e as Error).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [initialData, mapGoalsToRows, token]);

  // Filtrado y ordenamiento
  const filteredData = React.useMemo(() => {
    let rows = [...data];
    if (search) {
      rows = rows.filter((row) =>
        row.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter && statusFilter !== "all") {
      rows = rows.filter((row) => row.status === statusFilter);
    }
    if (priorityFilter && priorityFilter !== "all") {
      rows = rows.filter((row) => row.priority === priorityFilter);
    }
    rows.sort((a, b) => {
      const aVal = a[sortBy as keyof DatatableRow];
      const bVal = b[sortBy as keyof DatatableRow];
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        if (sortDir === "asc") return aVal.localeCompare(bVal);
        else return bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        if (sortDir === "asc") return aVal - bVal;
        else return bVal - aVal;
      }
      return 0;
    });
    return rows;
  }, [data, search, statusFilter, priorityFilter, sortBy, sortDir]);

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex flex-col gap-4 lg:px-6">
        <div className="flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            <AddGoalDrawer
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
              goal={editGoal}
              onCreated={(g) => {
                setData((prev) => [
                  ...prev,
                  mapGoalToRow(g as Goal, prev.length),
                ]);
              }}
              onUpdated={(g) => {
                setData((prev) =>
                  prev.map((row) =>
                    row.goalId === g._id
                      ? { ...row, ...mapGoalToRow(g as Goal, row.id - 1) }
                      : row
                  )
                );
                setEditGoal(null);
              }}
            />
            {loading && (
              <span className="text-muted-foreground text-xs">Cargando…</span>
            )}
            {error && <span className="text-destructive text-xs">{error}</span>}
          </div>
          <Button
            variant="secondary"
            className="ml-auto"
            onClick={() => setShowFilters((v) => !v)}
          >
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
        </div>
        {showFilters && (
          <Card className="w-full p-4 flex flex-col md:flex-row md:items-end gap-4 bg-muted/50 border border-muted-foreground/10 shadow-none">
            <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="search-goal"
              >
                Buscar
              </label>
              <Input
                id="search-goal"
                className="border rounded px-2 py-1 text-sm"
                placeholder="Por título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground">
                Estado
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border rounded px-2 py-1 text-sm">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground">
                Prioridad
              </label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="border rounded px-2 py-1 text-sm">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground">
                Ordenar por
              </label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border rounded px-2 py-1 text-sm">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Fecha creación</SelectItem>
                    <SelectItem value="dueDate">Fecha límite</SelectItem>
                    <SelectItem value="title">Título</SelectItem>
                    <SelectItem value="priority">Prioridad</SelectItem>
                    <SelectItem value="status">Estado</SelectItem>
                    <SelectItem value="progress">Progreso</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="border rounded px-2 py-1 text-sm"
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  title="Cambiar dirección"
                  variant={"outline"}
                >
                  {sortDir === "asc" ? "⬆️" : "⬇️"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
      <SwipeableList
        type={ListType.ANDROID}
        fullSwipe={true}
        className="grid gap-4 "
      >
        {Array.isArray(filteredData) && filteredData.length > 0 ? (
          filteredData.map((item) => (
            <SwipeableListItem
              key={item.id}
              leadingActions={
                <LeadingActions>
                  <SwipeAction onClick={() => handleEdit(item)}>
                    <div className="flex items-center justify-center w-full bg-gray-500 text-white font-bold relative bg-cover bg-center m-1 rounded mb-4 ">
                      Editar
                    </div>
                  </SwipeAction>
                </LeadingActions>
              }
              trailingActions={
                <TrailingActions>
                  <SwipeAction onClick={() => handleDeleteDialog(item.goalId)}>
                    <div className="flex justify-between items-center w-100 bg-red-500 text-white font-bold relative bg-cover bg-center m-1 rounded mb-4 ">
                      Eliminar
                    </div>
                  </SwipeAction>
                </TrailingActions>
              }
            >
              <Card className="w-full">
                <CardHeader>
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      {item.title}
                    </CardTitle>
                    <Badge className="ml-2" variant="outline">
                      {item.category}
                    </Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Estado:
                    </span>
                    <Badge
                      className={
                        item.status === "completed"
                          ? "bg-green-500 text-black"
                          : item.status === "in_progress"
                          ? "bg-yellow-500 text-black"
                          : item.status === "pending"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-500 text-white"
                      }
                      variant="outline"
                    >
                      {item.status === "pending"
                        ? "Pendiente"
                        : item.status === "in_progress"
                        ? "En progreso"
                        : item.status === "completed"
                        ? "Completado"
                        : "Archivado"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Prioridad:
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        item.priority === "low"
                          ? "bg-green-500/50"
                          : item.priority === "medium"
                          ? "bg-yellow-500/50"
                          : "bg-red-500/50"
                      }
                    >
                      {item.priority === "low"
                        ? "Baja"
                        : item.priority === "medium"
                        ? "Media"
                        : "Alta"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Progreso:
                    </span>
                    <Progress
                      value={item.progress}
                      max={100}
                      className="w-24"
                      aria-label="Progreso"
                    />
                    <span className="text-xs">{item.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Fecha límite:
                    </span>
                    <span className="text-xs">
                      {item.dueDate ? item.dueDate.slice(0, 10) : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </SwipeableListItem>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No hay resultados.
          </div>
        )}
      </SwipeableList>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar objetivo?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Seguro que quieres eliminar
              este objetivo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}

// ...existing code...
