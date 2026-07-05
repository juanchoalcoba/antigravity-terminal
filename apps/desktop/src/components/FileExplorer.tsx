import React, { useState } from 'react';

export interface FileInfo {
  name: string;
  is_dir: boolean;
  size: number;
  modified: number;
  extension: string | null;
}

interface FileExplorerProps {
  files: FileInfo[];
  currentPath?: string;
}

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Antigravity-inspired aesthetic icons and colors
function getThemeForFile(ext: string | null, isDir: boolean): { icon: string; color: string; bg: string } {
  if (isDir) return { icon: '📁', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' }; 
  
  if (!ext) return { icon: '📄', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)' };
  
  switch (ext.toLowerCase()) {
    case 'ts':
    case 'tsx':
      return { icon: 'TS', color: '#3178c6', bg: 'rgba(49, 120, 198, 0.1)' };
    case 'js':
    case 'jsx':
      return { icon: 'JS', color: '#f7df1e', bg: 'rgba(247, 223, 30, 0.1)' };
    case 'rs':
      return { icon: 'RS', color: '#dea584', bg: 'rgba(222, 165, 132, 0.1)' };
    case 'json':
      return { icon: '{}', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    case 'css':
      return { icon: '#', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' };
    case 'html':
      return { icon: '<>', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' };
    case 'md':
      return { icon: 'M↓', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' };
    case 'toml':
    case 'yml':
    case 'yaml':
      return { icon: '⚙', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' };
    default:
      return { icon: '📄', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)' };
  }
}

export function FileExplorer({ files, currentPath = 'C:\\' }: FileExplorerProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  // Normalize path and split for breadcrumbs
  const pathParts = currentPath.replace(/\\/g, '/').split('/').filter(Boolean);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: '#e2e8f0',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: '16px 20px',
      background: 'linear-gradient(180deg, rgba(15, 15, 17, 0) 0%, rgba(15, 15, 17, 0.4) 100%)',
    }}>
      {/* Sleek Breadcrumb Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        paddingBottom: '20px',
        marginBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
      }}>
        <div style={{ 
          color: '#a855f7', 
          marginRight: '12px', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 0 12px rgba(168, 85, 247, 0.2)'
        }}>
          ◫
        </div>
        
        {pathParts.map((part, i) => {
          const isLast = i === pathParts.length - 1;
          return (
            <React.Fragment key={i}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                fontWeight: isLast ? 600 : 400,
                color: isLast ? '#fff' : '#94a3b8',
                letterSpacing: '-0.3px',
                padding: '4px 8px',
                borderRadius: '6px',
                background: isLast ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                transition: 'color 0.2s',
                cursor: 'pointer',
              }}>
                {part}
              </div>
              {!isLast && (
                <span style={{ color: '#475569', margin: '0 4px', fontSize: '12px' }}>/</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Premium Data Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '12px',
        overflowY: 'auto',
        paddingRight: '6px',
        paddingBottom: '20px',
      }}>
        {files.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
            Empty directory
          </div>
        ) : files.map((file) => {
          const { icon, color, bg } = getThemeForFile(file.extension, file.is_dir);
          const isHovered = hoveredFile === file.name;

          return (
            <div
              key={file.name}
              onMouseEnter={() => setHoveredFile(file.name)}
              onMouseLeave={() => setHoveredFile(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 14px',
                background: isHovered ? 'rgba(255, 255, 255, 0.04)' : 'rgba(20, 20, 22, 0.6)',
                border: '1px solid',
                borderColor: isHovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered ? '0 8px 20px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {/* Icon Container */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isHovered ? bg : 'rgba(255,255,255,0.02)',
                color: isHovered ? color : '#64748b',
                marginRight: '14px',
                fontSize: file.is_dir ? '16px' : '11px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                border: '1px solid',
                borderColor: isHovered ? color : 'transparent',
                transition: 'all 0.2s ease',
              }}>
                {icon}
              </div>

              {/* File Info */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: isHovered ? 500 : 400,
                  color: isHovered ? '#fff' : '#cbd5e1',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '2px',
                  fontFamily: "'Inter', sans-serif"
                }} title={file.name}>
                  {file.name}
                </div>
                
                <div style={{
                  fontSize: '11px',
                  color: '#64748b',
                  fontFamily: "'JetBrains Mono', monospace",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {file.is_dir ? (
                    <span>DIR</span>
                  ) : (
                    <>
                      <span>{formatBytes(file.size)}</span>
                      {file.extension && (
                        <>
                          <span style={{ color: '#475569' }}>•</span>
                          <span style={{ textTransform: 'uppercase' }}>{file.extension}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
