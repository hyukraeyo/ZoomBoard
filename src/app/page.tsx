
import Sidebar from '@/components/layout/Sidebar';

export default function Home() {
  return (
    <main style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
        <p>왼쪽 사이드바에서 페이지를 선택하세요</p>
      </div>
    </main>
  );
}
