import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { KanbanBucket } from '@/components/KanbanBucket';
import { useAppStore } from '@/store/app-store';

export function KanbanView() {
  const { buckets, moveItem, updateItemLabel } = useAppStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Parse the active item's bucket and label
    const [fromBucket, itemLabel] = activeId.split('::');
    
    // If dropped on a bucket name (droppable), use that as the target
    // If dropped on another card, extract the bucket from that card's ID
    let toBucket: string;
    if (overId.includes('::')) {
      [toBucket] = overId.split('::');
    } else {
      toBucket = overId;
    }

    if (fromBucket !== toBucket) {
      moveItem(itemLabel, fromBucket, toBucket);
    }
  };

  const handleUpdateLabel = (bucketName: string, oldLabel: string, newLabel: string) => {
    updateItemLabel(bucketName, oldLabel, newLabel);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto p-4">
        {buckets.map((bucket) => (
          <KanbanBucket
            key={bucket.name}
            bucket={bucket}
            onUpdateLabel={handleUpdateLabel}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="opacity-50">
            <div className="bg-card border rounded-lg p-3">
              {activeId.split('::')[1]}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
