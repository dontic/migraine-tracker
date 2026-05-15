import { useState } from "react";
import { PlusIcon } from "lucide-react";
import SideBarLayout from "@/layouts/SideBarLayout";
import { Button } from "@/components/ui/button";
import { EpisodeTable } from "@/components/migraines/EpisodeTable";
import { EpisodeFormDialog } from "@/components/migraines/EpisodeFormDialog";

const MigraineLog = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editEpisodeId, setEditEpisodeId] = useState<number | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleEdit(id: number) {
    setEditEpisodeId(id);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open) setEditEpisodeId(undefined);
  }

  return (
    <SideBarLayout
      title="Migraine Log"
      actions={
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <PlusIcon className="size-4" />
          New
        </Button>
      }
    >
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <EpisodeTable
          refreshKey={refreshKey}
          onEdit={handleEdit}
          onDeleted={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      <EpisodeFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSuccess={() => setRefreshKey((k) => k + 1)}
        episodeId={editEpisodeId}
      />
    </SideBarLayout>
  );
};

export default MigraineLog;
