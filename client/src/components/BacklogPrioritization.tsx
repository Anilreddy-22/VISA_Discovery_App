import React from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Target, RotateCcw } from 'lucide-react';

type UseCase = {
  id: string;
  painPointId: string;
  name: string;
  category: string;
  problem: string;
  agentRole: string;
  dataRequired: string;
  integration: string;
  revenueImpact: string;
  costSavings: string;
  riskReduction: string;
  timeToValue: string;
  impact: "High" | "Medium" | "Low";
  effort: "Low" | "Medium" | "High";
  priority: string;
  agentCount: string;
  dataCloud: string;
  otherLicenses: string[];
  timeline: string;
  calculatedRevenue?: number;
  calculatedSavings?: number;
  calculatedEfficiency?: number;
  backlogPriority?: 'P1' | 'P2' | 'P3';
};

function DraggableUseCase({ useCase, onReturn, showReturn }: { useCase: UseCase; onReturn?: () => void; showReturn?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: useCase.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-start gap-2 text-sm p-2 bg-white border border-gray-200 rounded hover:shadow-md transition-all group ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div {...listeners} {...attributes} className="flex items-start gap-2 flex-1 cursor-move">
        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
        <span className="font-medium">{useCase.name}</span>
      </div>
      {showReturn && onReturn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReturn();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
          title="Return to Backlog"
        >
          <RotateCcw className="w-3 h-3 text-gray-500 hover:text-gray-700" />
        </button>
      )}
    </div>
  );
}

function PriorityBucket({ 
  id, 
  title, 
  subtitle, 
  items, 
  borderColor,
  icon: Icon,
  onReturnToBacklog 
}: { 
  id: string; 
  title: string; 
  subtitle: string; 
  items: UseCase[];
  borderColor: string;
  icon: any;
  onReturnToBacklog: (useCaseId: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id });

  const totalROI = items.reduce((acc, item) => acc + (item.calculatedRevenue || 0) + (item.calculatedSavings || 0), 0);

  return (
    <Card className={`border-t-4 ${borderColor} shadow-lg h-full`}>
      <CardHeader>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{subtitle}</div>
        <CardTitle className="text-2xl flex items-center justify-between">
          {title}
          <span className="text-xs font-normal text-gray-600 px-2 py-0.5 bg-white rounded-full border border-gray-300">
            {items.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
          {items.map(uc => (
            <DraggableUseCase 
              key={uc.id} 
              useCase={uc} 
              showReturn={true}
              onReturn={() => onReturnToBacklog(uc.id)}
            />
          ))}
          {items.length === 0 && (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-lg p-8">
              Drop use cases here
            </div>
          )}
        </div>
        <div className="pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground mb-1">Projected Impact</div>
          <div className="text-xl font-mono font-bold text-[var(--color-buyframe-red)]">
            ${totalROI.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BacklogPrioritization({ 
  items, 
  onUpdate 
}: { 
  items: UseCase[], 
  onUpdate: (items: UseCase[]) => void 
}) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const activeItem = items.find(i => i.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id) {
      const bucketId = over.id as string;
      const useCaseId = active.id as string;

      // Map bucket IDs to backlog priority values
      // IMPORTANT: Do NOT modify quadrant here - it was set in Step 3 and must be preserved
      let backlogPriority: UseCase['backlogPriority'] | undefined = undefined;

      switch (bucketId) {
        case 'p1':
          backlogPriority = 'P1';
          break;
        case 'p2':
          backlogPriority = 'P2';
          break;
        case 'p3':
          backlogPriority = 'P3';
          break;
        case 'backlog':
          backlogPriority = undefined;
          break;
      }

      const updatedItems = items.map(item =>
        item.id === useCaseId
          ? { ...item, backlogPriority }
          : item
      );

      onUpdate(updatedItems);
    }
  };

  const handleReturnToBacklog = (useCaseId: string) => {
    // When returning to backlog, only clear backlogPriority
    // IMPORTANT: Do NOT clear quadrant - it was set in Step 3 and must be preserved
    const updatedItems = items.map(item =>
      item.id === useCaseId
        ? { ...item, backlogPriority: undefined }
        : item
    );
    onUpdate(updatedItems);
  };

  const backlogItems = items.filter(i => !i.backlogPriority);
  const p1Items = items.filter(i => i.backlogPriority === 'P1');
  const p2Items = items.filter(i => i.backlogPriority === 'P2');
  const p3Items = items.filter(i => i.backlogPriority === 'P3');

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-8">
        {/* Backlog Box */}
        <div className="w-80 flex-shrink-0">
          <div className="border border-border rounded-lg p-6 bg-gray-50 sticky top-8">
            <div className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
              Backlog
              <span className="text-xs font-normal text-gray-600 px-2 py-0.5 bg-white rounded-full border border-gray-300">
                {backlogItems.length}
              </span>
            </div>
            <p className="text-[10px] text-gray-600 mb-3">Drag use cases to priority buckets</p>
            <div ref={useDroppable({ id: 'backlog' }).setNodeRef} className="space-y-2 min-h-[300px]">
              {backlogItems.map(item => (
                <DraggableUseCase key={item.id} useCase={item} />
              ))}
              {backlogItems.length === 0 && (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-lg p-8">
                  All use cases prioritized
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Priority Buckets */}
        <div className="flex-1 grid md:grid-cols-3 gap-8">
          <PriorityBucket
            id="p1"
            title="P1 Quick Wins"
            subtitle="Jan 31st - April 30th"
            items={p1Items}
            borderColor="border-t-[var(--color-buyframe-red)]"
            icon={CheckCircle2}
            onReturnToBacklog={handleReturnToBacklog}
          />
          <PriorityBucket
            id="p2"
            title="P2 Strategic"
            subtitle="H2 / TBD"
            items={p2Items}
            borderColor="border-t-black"
            icon={Clock}
            onReturnToBacklog={handleReturnToBacklog}
          />
          <PriorityBucket
            id="p3"
            title="P3 Future"
            subtitle="TBD"
            items={p3Items}
            borderColor="border-t-gray-300"
            icon={Target}
            onReturnToBacklog={handleReturnToBacklog}
          />
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="flex items-start gap-2 text-sm p-2 bg-white border border-gray-200 rounded shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="font-medium">{activeItem.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
