import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconGripVertical,
  IconLayoutColumns,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
// import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { type DatatableRow } from "./DatatableGoals.schema";
import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";
// import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
// import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  // TabsList,
  // TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import AddGoalDrawer from "./GoalDrawer";
import { Goal } from "@/types/goal";
import { Slider } from "./ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// columnas se definen dentro del componente para tener acceso a handlers

function DraggableRow({ row }: { row: Row<DatatableRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({ data: initialData }: { data?: DatatableRow[] }) {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [data, setData] = React.useState<DatatableRow[]>(
    () => initialData ?? []
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // Utilidades para mapear Goals del backend al esquema de la tabla
  const mapGoalToRow = React.useCallback(
    (g: Goal, idx: number): DatatableRow => ({
      id: idx + 1,
      goalId: g._id,
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

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  // Guardar cambios de una goal (optimista)
  const saveGoal = React.useCallback(
    async (goalId: string, patch: Partial<Goal>) => {
      if (!token) return;

      // Optimistic UI update
      setData((prev) => {
        const idx = prev.findIndex((r) => r.goalId === goalId);
        if (idx === -1) return prev;
        const next = [...prev];
        const prevRow = next[idx];
        const updated: DatatableRow = {
          ...prevRow,
          title: patch.title ?? prevRow.title,
          category: (patch.category as string | undefined) ?? prevRow.category,
          status: (patch.status as DatatableRow["status"]) ?? prevRow.status,
          priority:
            (patch.priority as DatatableRow["priority"]) ?? prevRow.priority,
          progress:
            typeof patch.progress === "number"
              ? Math.max(0, Math.min(100, Math.round(patch.progress)))
              : prevRow.progress,
          dueDate:
            (patch.dueDate as string | undefined) !== undefined
              ? (patch.dueDate as string)
              : prevRow.dueDate,
        };
        next[idx] = updated;
        return next;
      });

      try {
        const res = await fetch(`/api/goals/${goalId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("No se pudo guardar el cambio");
      } catch {
        // Rollback: recargar desde backend para mantener consistencia
        try {
          const res = await fetch("/api/goals", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const goals: Goal[] = await res.json();
            setData(mapGoalsToRows(goals));
          }
        } catch {
          // ignore secondary rollback failure
        }
      }
    },
    [token, mapGoalsToRows]
  );

  // Columnas (solo lectura). La edición se hace en el Drawer
  const columns = React.useMemo<ColumnDef<DatatableRow>[]>(
    () => [
      {
        id: "drag",
        header: () => null,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <DragHandle id={row.original.id} />
          </div>
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: () => <div>Título</div>,
        cell: ({ row }) => (
          <TableCellViewer item={row.original} onSave={saveGoal} />
        ),
      },
      {
        accessorKey: "category",
        header: () => <div>Categoría</div>,
        cell: ({ row }) => <span>{row.original.category ?? "-"}</span>,
      },
      {
        accessorKey: "status",
        header: () => <div>Estado</div>,
        cell: ({ row }) => {
          const bgs: Record<Goal["status"], string> = {
            pending: "bg-blue-500 text-white",
            in_progress: "bg-yellow-500 text-black",
            completed: "bg-green-500 text-black",
            archived: "bg-gray-500 text-white",
          };
          const traducion_esp = {
            pending: "Pendiente",
            in_progress: "En progreso",
            completed: "Completado",
            archived: "Archivado",
          };
          return (
            <Badge className={bgs[row.original.status]}>
              {traducion_esp[row.original.status]}
            </Badge>
          );
        },
      },
      {
        accessorKey: "priority",
        header: () => <div>Prioridad</div>,
        cell: ({ row }) => {
          const bgs: Record<Goal["priority"], string> = {
            low: "bg-green-500/40 text-white",
            medium: "bg-yellow-500/40 text-white",
            high: "bg-red-500/40 text-white",
          };
          const traduccion_esp = {
            low: "Baja",
            medium: "Media",
            high: "Alta",
          };
          return (
            <Badge className={bgs[row.original.priority]} variant={"outline"}>
              {traduccion_esp[row.original.priority]}
            </Badge>
          );
        },
      },
      {
        accessorKey: "progress",
        header: () => <div>Progreso</div>,
        cell: ({ row }) => (
          <Progress
            value={row.original.progress}
            max={100}
            className="w-[60%]"
            aria-label="Progreso"
          />
        ),
      },
      {
        accessorKey: "dueDate",
        header: () => <div>Fecha límite</div>,
        cell: ({ row }) => (
          <span>
            {row.original.dueDate ? row.original.dueDate.slice(0, 10) : "-"}
          </span>
        ),
      },
    ],
    [saveGoal]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Personalizar Columnas</span>
                <span className="lg:hidden">Columnas</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {{
                        title: "Título",
                        category: "Categoría",
                        status: "Estado",
                        priority: "Prioridad",
                        progress: "Progreso",
                        dueDate: "Fecha límite",
                      }[column.id as string] ?? column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddGoalDrawer
            onCreated={(g) => {
              setData((prev) => [
                ...prev,
                mapGoalToRow(g as Goal, prev.length),
              ]);
            }}
          />
          {loading && (
            <span className="text-muted-foreground text-xs">Cargando…</span>
          )}
          {error && <span className="text-destructive text-xs">{error}</span>}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            Filas por página
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllLeafColumns().length}
                      className="h-24 text-center"
                    >
                      No hay resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la primera página</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la página anterior</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la siguiente página</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la última página</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}

function TableCellViewer({
  item,
  onSave,
}: {
  item: DatatableRow;
  onSave: (goalId: string, patch: Partial<Goal>) => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState(item.title);
  const [category, setCategory] = React.useState(item.category ?? "");
  const [status, setStatus] = React.useState<Goal["status"]>(item.status);
  const [priority, setPriority] = React.useState<Goal["priority"]>(
    item.priority
  );
  const [progress, setProgress] = React.useState(String(item.progress));
  const [due, setDue] = React.useState(
    item.dueDate ? item.dueDate.slice(0, 10) : ""
  );

  React.useEffect(() => {
    if (!open) return;
    // sync when opening in case row changed
    setTitle(item.title);
    setCategory(item.category ?? "");
    setStatus(item.status);
    setPriority(item.priority);
    setProgress(String(item.progress));
    setDue(item.dueDate ? item.dueDate.slice(0, 10) : "");
    setError(null);
  }, [open, item]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const patch: Partial<Goal> = {};
      if (title !== item.title) patch.title = title.trim();
      const normCat = category.trim();
      if ((item.category ?? "") !== normCat)
        patch.category = normCat || undefined;
      if (status !== item.status) patch.status = status;
      if (priority !== item.priority) patch.priority = priority;
      const n = Number(progress);
      if (!Number.isNaN(n) && Math.round(n) !== item.progress) {
        patch.progress = Math.max(0, Math.min(100, Math.round(n)));
      }
      const iso = due ? new Date(`${due}T00:00:00`).toISOString() : undefined;
      if ((item.dueDate ?? undefined) !== iso) patch.dueDate = iso;

      if (Object.keys(patch).length > 0) {
        await onSave(item.goalId, patch);
      }
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      direction={"bottom"}
      open={open}
      onOpenChange={setOpen}
      dismissible={false}
    >
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Modificar {item.title}</DrawerTitle>
          <DrawerDescription>Detalles del objetivo</DrawerDescription>
        </DrawerHeader>
        <form
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-3">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              type="text"
              autoComplete="off"
              inputMode="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                type="text"
                autoComplete="off"
                inputMode="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as Goal["status"])}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="progress">Progreso ({progress}%)</Label>
              <Slider
                value={[Number(progress)]}
                onValueChange={(v) =>
                  setProgress(String(Array.isArray(v) ? v[0] : v))
                }
                min={0}
                max={100}
                step={1}
                id="progress"
                className="my-auto"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="dueDate">Fecha de vencimiento</Label>
              <div className="hidden w-full sm:block">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!due}
                      className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon />
                      {due ? due : <span>Selecciona fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={due ? new Date(due) : undefined}
                      onSelect={(date) =>
                        setDue(date ? format(date, "dd/MM/yyyy") : "")
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-full sm:hidden">
                <Input
                  id="dueDate"
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="priority">Prioridad</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as Goal["priority"])}
            >
              <SelectTrigger id="priority" className="w-full">
                <SelectValue placeholder="Select a priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-destructive">{error}</div>}
          <DrawerFooter className="px-0">
            <div className="flex gap-2 justify-end">
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
              </DrawerClose>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
