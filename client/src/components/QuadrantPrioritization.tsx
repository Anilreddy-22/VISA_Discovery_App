import React from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PainPoint = {
  id: string;
  category: "Time & Efficiency" | "Accuracy & Risk" | "Intelligence & Insights" | "Revenue & Growth";
  question: string;
  response: string;
  theme?: "Pricing" | "Sales" | "RevOps" | "Customer" | "Competitive";
  priority?: "H1" | "H2" | "TBD" | "Deprioritize";
  quadrant?: "Quick Wins" | "Major Projects" | "Fill-in" | "Money Pit";
};

type QuadrantProps = {
  id: string;
  title: string;
  description: string;
  items: PainPoint[];
  color: string;
};

function DraggableItem({ item, isOverlay = false, onReturnToBacklog }: { item: PainPoint, isOverlay?: boolean, onReturnToBacklog?: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: item
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const showReturnButton = item.quadrant && onReturnToBacklog;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "p-3 rounded-sm border-2 text-xs mb-2 bg-yellow-100 border-yellow-200 hover:shadow-md transition-all duration-200 group relative",
        isOverlay ? "shadow-2xl scale-105 rotate-1 z-50" : "hover:shadow-lg"
      )}
    >
      {showReturnButton && (
        <div 
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Return to backlog clicked for:', item.id);
              if (onReturnToBacklog) {
                onReturnToBacklog(item.id);
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white rounded-sm px-1.5 py-0.5 text-[10px] font-bold shadow-md cursor-pointer"
            title="Remove from quadrant"
            type="button"
          >
            ×
          </button>
        </div>
      )}
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        <div className="font-medium leading-relaxed text-gray-800">{item.response}</div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {item.theme}
          </span>
        </div>
      </div>
    </div>
  );
}

function Quadrant({ id, title, description, items, color, onReturnToBacklog }: QuadrantProps & { onReturnToBacklog?: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  // Color mapping for quadrants
  const bgColor = id === 'q1' ? 'bg-green-50' : 
                  id === 'q2' ? 'bg-blue-50' : 
                  id === 'q3' ? 'bg-amber-50' : 
                  id === 'q4' ? 'bg-red-50' : 'bg-gray-50';

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full rounded-lg border-2 transition-all p-3",
        bgColor,
        isOver ? "border-primary/50 shadow-lg" : "border-gray-300"
      )}
    >
      <div className="mb-3">
        <h3 className={cn("font-bold text-sm flex items-center gap-2", color)}>
          {title}
          <span className="text-xs font-normal text-gray-600 px-2 py-0.5 bg-white rounded-full border border-gray-300">
            {items.length}
          </span>
        </h3>
        <p className="text-[10px] text-gray-600 mt-1">{description}</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map(item => (
          <DraggableItem key={item.id} item={item} onReturnToBacklog={onReturnToBacklog} />
        ))}
        {items.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-lg">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}

export function QuadrantPrioritization({ 
  items, 
  onUpdate 
}: { 
  items: PainPoint[], 
  onUpdate: (items: PainPoint[]) => void 
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
        const quadrantId = over.id as string;
        const itemId = active.id as string;

        // Map quadrant IDs to priority and quadrant values
        let priority: PainPoint['priority'] | undefined = undefined;
        let quadrantName: PainPoint['quadrant'] | undefined = undefined;

        switch (quadrantId) {
          case 'q1': // High Impact, Low Effort
            priority = 'H1';
            quadrantName = 'Quick Wins';
            break;
          case 'q2': // High Impact, High Effort
            priority = 'H2';
            quadrantName = 'Major Projects';
            break;
          case 'q3': // Low Impact, Low Effort
            priority = 'TBD';
            quadrantName = 'Fill-in';
            break;
          case 'q4': // Low Impact, High Effort
            priority = 'Deprioritize';
            quadrantName = 'Money Pit';
            break;
          case 'unprioritized': // Back to source list
            priority = undefined;
            quadrantName = undefined;
            break;
        }

        const newItems = items.map(item => 
          item.id === itemId 
            ? { ...item, priority, quadrant: quadrantName } 
            : item
        );
        
        onUpdate(newItems);
      }
  };

  const handleReturnToBacklog = (itemId: string) => {
    const newItems = items.map(item => 
      item.id === itemId 
        ? { ...item, priority: undefined, quadrant: undefined } 
        : item
    );
    onUpdate(newItems);
  };

  // Group items by explicit quadrant only (no priority fallback)
  const q1Items = items.filter(i => i.quadrant === 'Quick Wins');
  const q2Items = items.filter(i => i.quadrant === 'Major Projects');
  const q3Items = items.filter(i => i.quadrant === 'Fill-in');
  const q4Items = items.filter(i => i.quadrant === 'Money Pit');

  // Items without a quadrant stay in backlog regardless of priority
  const unassignedItems = items.filter(i => !i.quadrant);

  return (
    <DndContext 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="flex gap-6">
        {/* Source List - Scrollable */}
        <div className="w-64 flex flex-col" style={{marginRight: '60px'}}>
          <div className="font-bold text-base mb-3">Unprioritized Items</div>
          <div className="bg-gray-50 rounded-lg border-2 border-gray-300 p-3 overflow-y-auto" style={{maxHeight: '500px', marginTop: '0'}}>
            <div className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
              Backlog
              <span className="text-xs font-normal text-gray-600 px-2 py-0.5 bg-white rounded-full border border-gray-300">
                {items.filter(i => !i.quadrant).length}
              </span>
            </div>
            <p className="text-[10px] text-gray-600 mb-3">Drag items to quadrants</p>
            <div ref={useDroppable({ id: 'unprioritized' }).setNodeRef}>
              {items.filter(i => !i.quadrant).map(item => (
                <DraggableItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Quadrants Grid - Fits viewport */}
        <div className="flex-1 relative mb-8">
          {/* Y Axis Label - Vertical on left side */}
          <div className="absolute -left-16 top-0 flex flex-col justify-between py-12" style={{width: '40px', height: '500px'}}>
            <div className="text-sm font-bold text-green-600 tracking-wider uppercase" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center'}}>HIGH IMPACT</div>
            <div className="text-sm font-bold text-red-600 tracking-wider uppercase" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center'}}>LOW IMPACT</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 relative" style={{height: '500px'}}>
            {/* Axis Labels */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
              <div className="w-full h-px bg-border absolute top-1/2 -translate-y-1/2" />
              <div className="h-full w-px bg-border absolute left-1/2 -translate-x-1/2" />
            </div>
            
            {/* X Axis Label */}
            <div className="absolute -bottom-10 left-0 right-0 flex justify-between items-center px-4">
              <span className="text-xs font-bold text-green-600 tracking-wide uppercase">Low Effort</span>
              <span className="text-xs font-bold text-red-600 tracking-wide uppercase">High Effort</span>
            </div>

          {/* Quadrants */}
            <Quadrant 
              id="q1" 
              title="Quick Wins" 
              description="High Impact, Low Effort" 
              items={q1Items}
              color="text-green-600"
              onReturnToBacklog={handleReturnToBacklog}
            />
            <Quadrant 
              id="q2" 
              title="Major Projects" 
              description="High Impact, High Effort" 
              items={q2Items}
              color="text-blue-600"
              onReturnToBacklog={handleReturnToBacklog}
            />
            <Quadrant 
              id="q3" 
              title="Fill-ins" 
              description="Low Impact, Low Effort" 
              items={q3Items}
              color="text-yellow-600"
              onReturnToBacklog={handleReturnToBacklog}
            />
            <Quadrant 
              id="q4" 
              title="Money Pit" 
              description="Low Impact, High Effort" 
              items={q4Items}
              color="text-red-600"
              onReturnToBacklog={handleReturnToBacklog}
            />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeItem ? <DraggableItem item={activeItem} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
