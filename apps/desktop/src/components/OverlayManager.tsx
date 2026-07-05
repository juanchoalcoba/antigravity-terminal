import { useEffect, useState } from 'react';

export function OverlayManager() {
  const [visualData, setVisualData] = useState<{ command: string, data: any } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleOutputReady = (e: Event) => {
      const customEvent = e as CustomEvent;
      setVisualData(customEvent.detail);
      setVisible(true);
    };

    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      setVisible(customEvent.detail.visible);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
      }
    };

    window.addEventListener('visual-output-ready', handleOutputReady);
    window.addEventListener('terminal-overlay-toggle', handleToggle);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('visual-output-ready', handleOutputReady);
      window.removeEventListener('terminal-overlay-toggle', handleToggle);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!visible || !visualData) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '80%',
      backgroundColor: '#252526',
      border: '1px solid #454545',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      overflowY: 'auto',
      zIndex: 1000,
      color: '#d4d4d4',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #454545', paddingBottom: '8px', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#61afef' }}>Visual Interface: {visualData.command}</h3>
        <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', color: '#d4d4d4', cursor: 'pointer' }}>✕</button>
      </div>
      
      <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        {JSON.stringify(visualData.data, null, 2)}
      </pre>
    </div>
  );
}
