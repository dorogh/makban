import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KanbanCard } from "@/components/KanbanCard";
import type { MarkdownBucket } from "@/lib/markdown";
import { cn } from "@/lib/utils";

interface KanbanBucketProps {
  bucket: MarkdownBucket;
  onUpdateLabel: (
    bucketName: string,
    oldLabel: string,
    newLabel: string,
  ) => void;
}

export function KanbanBucket({ bucket, onUpdateLabel }: KanbanBucketProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: bucket.name,
  });

  const itemIds = bucket.items.map((item) => `${bucket.name}::${item.label}`);

  return (
    <div className="flex-shrink-0 w-50 md:w-80">
      <Card
        ref={setNodeRef}
        className={cn(
          "h-full min-h-[200px]",
          isOver && "ring-2 ring-primary",
          "bg-card/80",
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg">{bucket.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            {bucket.items.map((item) => (
              <KanbanCard
                key={`${bucket.name}::${item.label}`}
                id={`${bucket.name}::${item.label}`}
                label={item.label}
                checked={item.checked}
                bucketName={bucket.name}
                onUpdateLabel={(oldLabel, newLabel) =>
                  onUpdateLabel(bucket.name, oldLabel, newLabel)
                }
              />
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}
