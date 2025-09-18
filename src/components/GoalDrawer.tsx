import { useAuth } from "@/providers/auth-provider";
import { Goal } from "@/types/goal";
import * as React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { IconPlus } from "@tabler/icons-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";

function AddGoalDrawer({ onCreated }: { onCreated: (goal: Goal) => void }) {
  const { token } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    title: "",
    category: "",
    priority: "medium" as Goal["priority"],
    dueDate: "",
    description: "",
    visibility: "private" as "private" | "public",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        category: form.category.trim() || undefined,
        priority: form.priority,
        description: form.description.trim() || undefined,
        visibility: form.visibility,
      };
      if (form.dueDate) body.dueDate = new Date(form.dueDate).toISOString();
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo crear el objetivo");
      }
      const goal = (await res.json()) as Goal;
      onCreated(goal);
      setOpen(false);
      setForm({
        title: "",
        category: "",
        priority: "medium",
        dueDate: "",
        description: "",
        visibility: "private",
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="inline">Añadir Objetivo</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Añadir Objetivo</DrawerTitle>
          <DrawerDescription>Crear un nuevo objetivo</DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="ng-title">Título</Label>
            <Input
              id="ng-title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="ng-category">Categoría</Label>
            <Input
              id="ng-category"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="ng-priority">Prioridad</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, priority: v as Goal["priority"] }))
                }
              >
                <SelectTrigger id="ng-priority" className="w-full">
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="ng-visibility">Visibilidad</Label>
              <Select
                value={form.visibility}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    visibility: v as "private" | "public",
                  }))
                }
              >
                <SelectTrigger id="ng-visibility" className="w-full">
                  <SelectValue placeholder="Seleccionar visibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Privada</SelectItem>
                  <SelectItem value="public">Pública</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ng-due">Fecha de vencimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!form.dueDate}
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon />
                    {form.dueDate ? (
                      form.dueDate
                    ) : (
                      <span>Selecciona fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.dueDate ? new Date(form.dueDate) : undefined}
                    onSelect={(date) =>
                      setForm((f) => ({
                        ...f,
                        dueDate: date ? format(date, "dd/MM/yyyy") : "",
                      }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ng-desc">Descripción</Label>
            <Input
              id="ng-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DrawerClose>
            <Button type="submit" disabled={submitting || !form.title.trim()}>
              {submitting ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
export default AddGoalDrawer;
