import InfiniteCanvas from '@/components/canvas/InfiniteCanvas';
import Sidebar from '@/components/layout/Sidebar';

export default function Home() {
  return (
    <main style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <InfiniteCanvas />
      </div>
    </main>
  );
}
