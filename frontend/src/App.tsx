import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { StatsFooter } from './components/StatsFooter';
import ClientInfo from './pages/ClientInfo';
import Dashboard from './pages/Dashboard';
import DisciplineSummary from './pages/DisciplineSummary';
import CapabilityArea from './pages/CapabilityArea';
import Export from './pages/Export';
import Settings from './pages/Settings';
import Help from './pages/Help';

const STORAGE_KEY = 'tbm-sidebar';
const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 480;
const SIDEBAR_DEFAULT = 350;
const SIDEBAR_COLLAPSED = 56;

function AppShell() {
  const location = useLocation();
  const { loading } = useStore();
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, unknown>;
    } catch {
      return {};
    }
  })();
  const [sidebarWidth, setSidebarWidth] = useState(
    typeof stored.width === 'number' ? stored.width : SIDEBAR_DEFAULT
  );
  const [collapsed, setCollapsed] = useState(
    typeof stored.collapsed === 'boolean' ? stored.collapsed : false
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isResizing = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: sidebarWidth, collapsed }));
  }, [sidebarWidth, collapsed]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const onMouseDownDivider = useCallback(
    (e: React.MouseEvent) => {
      if (collapsed) return;
      e.preventDefault();
      isResizing.current = true;
      const startX = e.clientX;
      const startWidth = sidebarWidth;
      const onMove = (ev: MouseEvent) => {
        if (!isResizing.current) return;
        const delta = ev.clientX - startX;
        setSidebarWidth(Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startWidth + delta)));
      };
      const onUp = () => {
        isResizing.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [collapsed, sidebarWidth]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-page-bg">
        <img src="/peraton-logo.png" alt="Peraton" className="w-[300px] mb-6" />
        <p className="text-text-tertiary text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const effectiveWidth = collapsed ? SIDEBAR_COLLAPSED : sidebarWidth;
  const pageKey = location.pathname;

  return (
    <div className="flex flex-col h-screen bg-page-bg text-text-primary overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          width={effectiveWidth}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        {!collapsed && (
          <div
            className="w-1 cursor-col-resize hover:bg-accent/40 transition-colors shrink-0"
            onMouseDown={onMouseDownDivider}
          />
        )}
        <main className="flex-1 overflow-auto p-6" key={pageKey}>
          <Routes>
            <Route path="/" element={<ClientInfo />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/discipline/:entityId" element={<DisciplineSummary />} />
            <Route path="/discipline/:entityId/:areaId" element={<CapabilityArea />} />
            <Route path="/export" element={<Export />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </main>
      </div>
      <StatsFooter />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </StoreProvider>
  );
}
