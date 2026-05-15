import { useState, useMemo } from "react";
import {
  CheckIcon,
  PencilIcon,
  Trash2Icon,
  PlusIcon,
  XIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ManagedItem {
  id: number;
  name: string;
}

interface ManagedMultiSelectProps {
  label: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  items: ManagedItem[];
  onCreateItem: (name: string) => Promise<void>;
  onUpdateItem: (id: number, name: string) => Promise<void>;
  onDeleteItem: (id: number) => Promise<void>;
  placeholder?: string;
}

export function ManagedMultiSelect({
  label,
  selectedIds,
  onChange,
  items,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  placeholder,
}: ManagedMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ManagedItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  function toggleId(id: number) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((v) => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function startEdit(item: ManagedItem, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(item.id);
    setEditName(item.name);
  }

  async function confirmEdit(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    if (!editingId || !editName.trim()) return;
    setIsLoading(true);
    try {
      await onUpdateItem(editingId, editName.trim());
    } finally {
      setIsLoading(false);
      setEditingId(null);
      setEditName("");
    }
  }

  function cancelEdit(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    setEditingId(null);
    setEditName("");
  }

  async function confirmCreate() {
    if (!newName.trim()) return;
    setIsLoading(true);
    try {
      await onCreateItem(newName.trim());
    } finally {
      setIsLoading(false);
      setIsAddingNew(false);
      setNewName("");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      await onDeleteItem(deleteTarget.id);
      if (selectedIds.includes(deleteTarget.id)) {
        onChange(selectedIds.filter((id) => id !== deleteTarget.id));
      }
    } finally {
      setIsLoading(false);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex h-auto min-h-9 w-full items-start justify-between gap-2 overflow-hidden rounded-md px-3 py-1.5 text-sm font-normal"
          >
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {selectedItems.length === 0 ? (
                <span className="text-muted-foreground py-0.5">
                  {placeholder ?? `Select ${label}...`}
                </span>
              ) : (
                selectedItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className="gap-1 font-normal"
                  >
                    {item.name}
                    <XIcon
                      className="size-2 cursor-pointer text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleId(item.id);
                      }}
                    />
                  </Badge>
                ))
              )}
            </div>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50 mt-0.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
          align="start"
        >
          <div className="p-2 border-b">
            <Input
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 text-sm"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filteredItems.length === 0 && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No {label.toLowerCase()} found
              </div>
            )}
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isEditing = editingId === item.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 text-sm cursor-pointer group hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent/40"
                  )}
                  onClick={() => !isEditing && toggleId(item.id)}
                >
                  <CheckIcon
                    className={cn(
                      "size-4 shrink-0",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {isEditing ? (
                    <div
                      className="flex flex-1 items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmEdit(e);
                          if (e.key === "Escape") cancelEdit(e);
                        }}
                        className="h-6 text-xs flex-1"
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={isLoading || !editName.trim()}
                        onClick={confirmEdit}
                      >
                        <CheckIcon className="size-3" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={cancelEdit}
                      >
                        <XIcon className="size-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{item.name}</span>
                      <div className="flex opacity-0 group-hover:opacity-100 shrink-0">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={(e) => startEdit(item, e)}
                        >
                          <PencilIcon className="size-3" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(item);
                          }}
                        >
                          <Trash2Icon className="size-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="border-t p-2">
            {isAddingNew ? (
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  placeholder={`New ${label.toLowerCase()} name...`}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmCreate();
                    if (e.key === "Escape") {
                      setIsAddingNew(false);
                      setNewName("");
                    }
                  }}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={isLoading || !newName.trim()}
                  onClick={confirmCreate}
                >
                  <CheckIcon className="size-3" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewName("");
                  }}
                >
                  <XIcon className="size-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs justify-start gap-1.5"
                onClick={() => setIsAddingNew(true)}
              >
                <PlusIcon className="size-3" />
                Add {label.toLowerCase()}
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {label}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
