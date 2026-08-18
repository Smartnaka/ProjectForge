"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/feedback/toast";
import { createSubmoduleItem, deleteSubmoduleItem, fetchSubmodule, updateSubmoduleItem } from "@/features/projects/project-repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type DbColumnItem = {
  id: string;
  name: string;
  type: string;
  primaryKey: boolean;
  foreignKey?: string | null;
  nullable: boolean;
};

type DbTableItem = {
  id: string;
  name: string;
  columns: DbColumnItem[];
};

export function DatabasePlannerModule({ projectId }: { projectId: string }) {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [tableName, setTableName] = useState("");
  const [selectedTable, setSelectedTable] = useState<DbTableItem | null>(null);

  // Column Addition State
  const [colName, setColName] = useState("");
  const [colType, setColType] = useState("String");
  const [isPk, setIsPk] = useState(false);
  const [isNullable, setIsNullable] = useState(false);
  const [fkRef, setFkRef] = useState("");

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["projects", projectId, "tables"],
    queryFn: () => fetchSubmodule<DbTableItem[]>(projectId, "tables"),
  });

  const createTableMutation = useMutation({
    mutationFn: (name: string) => createSubmoduleItem<DbTableItem>(projectId, "tables", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tables"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Table created", tone: "success" });
      setTableName("");
    },
    onError: (err: Error) => notify({ title: "Failed to create table", description: err.message, tone: "error" }),
  });

  const deleteTableMutation = useMutation({
    mutationFn: (id: string) => deleteSubmoduleItem(projectId, "tables", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tables"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Table deleted", tone: "success" });
      if (selectedTable?.id) setSelectedTable(null);
    },
  });

  const updateTableMutation = useMutation({
    mutationFn: ({ tableId, columns }: { tableId: string; columns: any[] }) =>
      updateSubmoduleItem<DbTableItem>(projectId, "tables", tableId, { columns }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tables"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Column added", tone: "success" });
      setSelectedTable(updated);
      setColName("");
      setFkRef("");
      setIsPk(false);
      setIsNullable(false);
    },
  });

  function handleCreateTable(e: React.FormEvent) {
    e.preventDefault();
    if (!tableName.trim()) return;
    createTableMutation.mutate(tableName.trim());
  }

  function handleAddColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTable || !colName.trim()) return;
    const currentCols = selectedTable.columns || [];
    const newCol = {
      name: colName.trim(),
      type: colType,
      primaryKey: isPk,
      nullable: isNullable,
      foreignKey: fkRef.trim() || undefined,
    };
    updateTableMutation.mutate({
      tableId: selectedTable.id,
      columns: [...currentCols, newCol],
    });
  }

  function handleRemoveColumn(colId: string) {
    if (!selectedTable) return;
    const updatedCols = selectedTable.columns.filter((c) => c.id !== colId);
    updateTableMutation.mutate({
      tableId: selectedTable.id,
      columns: updatedCols,
    });
  }

  const activeTable = tables.find((t) => t.id === selectedTable?.id) || selectedTable || tables[0] || null;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold">Database Designer</h2>
        <form onSubmit={handleCreateTable} className="mt-4 flex gap-3">
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Table name (e.g. User, Order, Payment)"
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 outline-none focus:border-violet-500"
          />
          <Button disabled={createTableMutation.isPending || !tableName.trim()}>
            <Plus size={16} /> Create Table
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <p className="text-sm text-[var(--muted)]">Loading schema tables...</p>
      ) : tables.length === 0 ? (
        <Card className="text-center py-10">
          <Database size={40} className="mx-auto text-[var(--muted)]" />
          <h3 className="mt-2 font-semibold text-lg">No Database Tables Planned</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Use the form above to add your first database model table.</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <Card className="p-3">
            <h3 className="px-3 py-1 font-semibold text-xs text-[var(--muted)] uppercase tracking-wider">Tables</h3>
            <div className="mt-2 space-y-1">
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTable?.id === t.id
                      ? "bg-violet-500/15 text-violet-700 dark:text-violet-200"
                      : "text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  <span className="text-xs text-[var(--muted)]">{t.columns?.length || 0} cols</span>
                </button>
              ))}
            </div>
          </Card>

          {activeTable && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{activeTable.name} Table</h2>
                    <p className="text-xs text-[var(--muted)]">{activeTable.columns?.length || 0} column definitions</p>
                  </div>
                  <button
                    onClick={() => deleteTableMutation.mutate(activeTable.id)}
                    disabled={deleteTableMutation.isPending}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-semibold"
                  >
                    <Trash2 size={14} /> Delete Table
                  </button>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                        <th className="pb-2 font-medium">Column</th>
                        <th className="pb-2 font-medium">Type</th>
                        <th className="pb-2 font-medium">PK</th>
                        <th className="pb-2 font-medium">Nullable</th>
                        <th className="pb-2 font-medium">FK Reference</th>
                        <th className="pb-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {activeTable.columns?.map((col) => (
                        <tr key={col.id || col.name}>
                          <td className="py-2.5 font-mono font-semibold">{col.name}</td>
                          <td className="py-2.5 text-violet-600 dark:text-violet-300 font-mono text-xs">{col.type}</td>
                          <td className="py-2.5">{col.primaryKey ? "✓" : "-"}</td>
                          <td className="py-2.5">{col.nullable ? "Yes" : "No"}</td>
                          <td className="py-2.5 text-xs text-[var(--muted)]">{col.foreignKey || "-"}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handleRemoveColumn(col.id)}
                              className="text-[var(--muted)] hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-sm">Add Column to {activeTable.name}</h3>
                <form onSubmit={handleAddColumn} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <input
                    value={colName}
                    onChange={(e) => setColName(e.target.value)}
                    placeholder="Column name"
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-violet-500"
                  />
                  <select
                    value={colType}
                    onChange={(e) => setColType(e.target.value)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="String">String (VARCHAR)</option>
                    <option value="UUID">UUID</option>
                    <option value="Int">Integer</option>
                    <option value="Boolean">Boolean</option>
                    <option value="DateTime">DateTime (TIMESTAMP)</option>
                    <option value="Json">JSON / JSONB</option>
                    <option value="Float">Float / Decimal</option>
                  </select>
                  <input
                    value={fkRef}
                    onChange={(e) => setFkRef(e.target.value)}
                    placeholder="FK Target (e.g. User.id)"
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-violet-500"
                  />
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={isPk} onChange={(e) => setIsPk(e.target.checked)} /> PK
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={isNullable} onChange={(e) => setIsNullable(e.target.checked)} /> Nullable
                    </label>
                  </div>
                  <Button disabled={updateTableMutation.isPending || !colName.trim()} className="text-xs">
                    <Plus size={14} /> Add Column
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
