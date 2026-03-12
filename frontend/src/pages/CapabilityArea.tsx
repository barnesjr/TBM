import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '@/store';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AssessmentItemCard } from '@/components/AssessmentItemCard';
import { capabilityAreaScore } from '@/scoring';
import { getMaturityBand } from '@/types';
import type { AssessmentItem, FrameworkItem } from '@/types';

export default function CapabilityArea() {
  const { entityId, areaId } = useParams();
  const { data, framework, updateData } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Find discipline and capability area
  const discipline = data?.disciplines.find((d) => d.id === entityId);
  const ca = discipline?.capability_areas.find((c) => c.id === areaId);

  // Find framework items for rubrics
  const frameworkDisc = framework?.disciplines.find((d) => d.id === entityId);
  const frameworkCA = frameworkDisc?.capability_areas.find((c) => c.id === areaId);
  const frameworkItemMap = new Map<string, FrameworkItem>();
  frameworkCA?.items.forEach((fi) => frameworkItemMap.set(fi.id, fi));

  const items = ca?.items ?? [];

  const handleItemUpdate = useCallback(
    (itemId: string, updates: Partial<AssessmentItem>) => {
      updateData((d) => {
        for (const disc of d.disciplines) {
          if (disc.id === entityId) {
            for (const area of disc.capability_areas) {
              if (area.id === areaId) {
                const item = area.items.find((i) => i.id === itemId);
                if (item) Object.assign(item, updates);
                return;
              }
            }
          }
        }
      });
    },
    [updateData, entityId, areaId]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInput) return;

      const currentItem = focusIndex >= 0 && focusIndex < items.length ? items[focusIndex] : null;

      // Score shortcuts
      if (['1', '2', '3', '4'].includes(e.key) && currentItem) {
        e.preventDefault();
        handleItemUpdate(currentItem.id, { score: parseInt(e.key), na: false, na_justification: null });
        return;
      }

      // Confidence shortcuts
      if (e.key.toLowerCase() === 'h' && currentItem) {
        e.preventDefault();
        handleItemUpdate(currentItem.id, { confidence: 'High' });
        return;
      }
      if (e.key.toLowerCase() === 'm' && currentItem) {
        e.preventDefault();
        handleItemUpdate(currentItem.id, { confidence: 'Medium' });
        return;
      }
      if (e.key.toLowerCase() === 'l' && currentItem) {
        e.preventDefault();
        handleItemUpdate(currentItem.id, { confidence: 'Low' });
        return;
      }

      // N/A toggle
      if (e.key.toLowerCase() === 'n' && currentItem) {
        e.preventDefault();
        handleItemUpdate(currentItem.id, {
          score: null,
          na: !currentItem.na,
          na_justification: !currentItem.na ? currentItem.na_justification : null,
        });
        return;
      }

      // Navigate up/down
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setFocusIndex((prev) => Math.min(prev + 1, items.length - 1));
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setFocusIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      // Toggle expand
      if ((e.key === 'Enter' || e.key === ' ') && currentItem) {
        e.preventDefault();
        setExpandedId((prev) => (prev === currentItem.id ? null : currentItem.id));
        return;
      }

      // Escape - unfocus
      if (e.key === 'Escape') {
        setFocusIndex(-1);
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusIndex, items, handleItemUpdate]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusIndex >= 0) {
      const el = itemRefs.current.get(focusIndex);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusIndex]);

  if (!data || !discipline || !ca) {
    return (
      <div className="p-8 page-enter">
        <p className="text-text-tertiary">
          {!data ? 'Loading...' : 'Capability area not found.'}
        </p>
      </div>
    );
  }

  const score = capabilityAreaScore(ca);
  const band = score !== null ? getMaturityBand(score) : null;
  const totalItems = items.length;
  const answeredItems = items.filter((i) => i.score !== null || i.na).length;

  return (
    <div className="max-w-4xl mx-auto page-enter">
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{ca.name}</h1>
          <p className="text-sm text-text-tertiary mt-1">
            {answeredItems}/{totalItems} items scored
          </p>
        </div>
        {score !== null && band && (
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: band.color }}>
              {score.toFixed(2)}
            </div>
            <div
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: band.color }}
            >
              {band.label}
            </div>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="text-[10px] text-text-tertiary mb-4">
        <span className="font-medium">Keyboard:</span> 1-4 score, H/M/L confidence, N toggle N/A,
        j/k navigate, Enter expand, Esc unfocus
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => {
              if (el) itemRefs.current.set(index, el);
              else itemRefs.current.delete(index);
            }}
            className={`rounded-xl transition-all duration-150 ${
              focusIndex === index ? 'ring-2 ring-accent/50' : ''
            }`}
            onClick={() => setFocusIndex(index)}
          >
            <AssessmentItemCard
              item={item}
              frameworkItem={frameworkItemMap.get(item.id)}
              onUpdate={(updates) => handleItemUpdate(item.id, updates)}
              expanded={expandedId === item.id}
              onToggleExpand={() =>
                setExpandedId((prev) => (prev === item.id ? null : item.id))
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
