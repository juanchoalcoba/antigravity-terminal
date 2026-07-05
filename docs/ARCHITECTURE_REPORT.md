# Antigravity Terminal — Informe de arquitectura y guía de estudio

## 1. Qué es este proyecto

Antigravity Terminal es un prototipo de terminal desktop local-first, pensado como una experiencia híbrida entre:

- una terminal tradicional,
- un panel visual que convierte ciertos comandos en vistas útiles,
- un contexto de sesión que aprende de la actividad del usuario,
- y un estado persistido localmente para que las sesiones sobrevivan a reinicios.

La idea central no es solo ejecutar comandos, sino dar contexto alrededor de lo que el usuario está haciendo.

---

## 2. Arquitectura general

El proyecto está organizado como un monorepo con tres capas principales:

1. Frontend web/desktop
   - React + TypeScript + Vite
   - se ejecuta dentro del shell de la app desktop

2. Runtime nativo
   - Tauri + Rust
   - maneja PTY, procesos, shell y eventos del sistema

3. Lógica compartida/extendible
   - crates Rust y paquetes internos del monorepo
   - sirven como base para futuras mejoras de inteligencia o integración

La arquitectura actual está pensada para ser simple y progresiva: primero se resuelve la experiencia local, luego se amplían capacidades.

---

## 3. Estructura del monorepo

### Raíz

- [Cargo.toml](../Cargo.toml)
  - define el workspace de Rust
  - por ahora solo incluye la app Tauri como miembro

- [package.json](../package.json)
  - define el workspace de Node/PNPM/Turbo
  - centraliza scripts de build, dev y lint

- [pnpm-workspace.yaml](../pnpm-workspace.yaml)
  - define los paquetes del monorepo

- [turbo.json](../turbo.json)
  - configura tareas de compilación compartidas

### Carpeta apps

Contiene la app ejecutable real.

- [apps/desktop](../apps/desktop)
  - es la app principal del producto
  - combina UI React, terminal xterm y backend Tauri

### Carpeta crates

Contiene lógica Rust más organizada o reutilizable.

- [crates/ag-core](../crates/ag-core)
- [crates/ag-ai](../crates/ag-ai)
- [crates/ag-plugins](../crates/ag-plugins)
- [crates/ag-pty](../crates/ag-pty)

En la etapa actual, la implementación real de PTY y comandos vive en la app Tauri, pero estas crates son el lugar natural para crecer.

### Carpeta packages

Contiene paquetes compartidos del monorepo.

- [packages/@antigravity/config](../packages/@antigravity/config)
- [packages/@antigravity/core](../packages/@antigravity/core)
- [packages/@antigravity/terminal](../packages/@antigravity/terminal)
- [packages/@antigravity/ui](../packages/@antigravity/ui)

Hoy la app usa principalmente el frontend directo, pero este espacio está preparado para abstraer UI y lógica común.

---

## 4. Flujo de la aplicación

### 4.1 Inicio

Al abrir la app:

1. React monta la UI principal.
2. El componente de terminal crea un PTY en Rust.
3. Se establece una sesión de shell.
4. La UI recupera sesiones previas desde localStorage.
5. Se restaura el contexto de la sesión activa.

### 4.2 Ejecución de comandos

Cuando el usuario escribe un comando:

1. el input se captura en la terminal UI,
2. la entrada se envía al PTY,
3. el output vuelve al frontend,
4. el sistema decide si ese comando tiene valor visual,
5. y si corresponde, se parsea para mostrar información útil en el panel visual.

### 4.3 Contexto y ayuda inteligente

La app intenta inferir contexto a partir del historial:

- si aparecen comandos de git, sugiere acciones como git status,
- si aparecen comandos de docker, sugiere docker compose ps,
- si aparece ps o top, sugiere monitoreo de procesos.

El objetivo es transformar la terminal en una herramienta de asistencia, no solo de ejecución.

---

## 5. Archivos clave y qué hacen

### 5.1 Frontend principal

- [apps/desktop/src/main.tsx](../apps/desktop/src/main.tsx)
  - punto de entrada React
  - monta la app en el DOM

- [apps/desktop/src/App.tsx](../apps/desktop/src/App.tsx)
  - componente raíz que renderiza el layout principal

- [apps/desktop/src/components/AppLayout.tsx](../apps/desktop/src/components/AppLayout.tsx)
  - organiza el shell principal en tres columnas: sidebar, terminal y panel visual
  - es el corazón del layout de escritorio

### 5.2 Componentes de UI

- [apps/desktop/src/components/Sidebar.tsx](../apps/desktop/src/components/Sidebar.tsx)
  - panel lateral con sesiones, historial, contexto y sugerencias
  - es el dashboard de estado del usuario

- [apps/desktop/src/components/TopBar.tsx](../apps/desktop/src/components/TopBar.tsx)
  - barra superior visual con identidad del proyecto y estado de sesión

- [apps/desktop/src/components/Terminal.tsx](../apps/desktop/src/components/Terminal.tsx)
  - integra xterm.js con el PTY de Tauri
  - recibe, muestra y redirige la salida del shell

- [apps/desktop/src/components/TerminalPanel.tsx](../apps/desktop/src/components/TerminalPanel.tsx)
  - maneja la ejecución y evolución de comandos a nivel de UI

- [apps/desktop/src/components/OutputPanel.tsx](../apps/desktop/src/components/OutputPanel.tsx)
  - muestra historial de comandos y resultados en una vista simple

- [apps/desktop/src/components/VisualPanel.tsx](../apps/desktop/src/components/VisualPanel.tsx)
  - panel lateral que muestra datos transformados desde comandos como git o docker

- [apps/desktop/src/components/VisualPanels.tsx](../apps/desktop/src/components/VisualPanels.tsx)
  - muestra resúmenes visuales de Git, Docker y procesos

- [apps/desktop/src/components/GitTimeline.tsx](../apps/desktop/src/components/GitTimeline.tsx)
  - renderiza una línea de tiempo de commits con estilo visual

### 5.3 Lógica de estado y contexto

- [apps/desktop/src/lib/sessionState.ts](../apps/desktop/src/lib/sessionState.ts)
  - modelo central de sesiones
  - maneja creación, activación, renombre, eliminación y contexto de cada sesión

- [apps/desktop/src/lib/sessionContext.ts](../apps/desktop/src/lib/sessionContext.ts)
  - produce insights y sugerencias basadas en el historial reciente

- [apps/desktop/src/lib/storage.ts](../apps/desktop/src/lib/storage.ts)
  - persistencia local con localStorage
  - permite que las sesiones sobrevivan al reinicio de la app

### 5.4 Router y parsers

- [apps/desktop/src/lib/CommandRouter.ts](../apps/desktop/src/lib/CommandRouter.ts)
  - clasifica comandos en categorías: text, system, navigation, visual

- [apps/desktop/src/lib/Parsers.ts](../apps/desktop/src/lib/Parsers.ts)
  - convierte output de terminal en estructuras de datos útiles para el panel visual
  - hoy soporta parsing de git log, docker ps y procesos del sistema

- [apps/desktop/src/lib/api.ts](../apps/desktop/src/lib/api.ts)
  - puente frontend hacia los comandos invocados en Tauri

### 5.5 Estilos globales

- [apps/desktop/src/index.css](../apps/desktop/src/index.css)
  - define tokens visuales, colores, bordes, radios y variables del layout

- [apps/desktop/src/App.css](../apps/desktop/src/App.css)
  - estilos adicionales de la app

---

## 6. Backend Tauri y Rust

### 6.1 Entrada de la app

- [apps/desktop/src-tauri/src/lib.rs](../apps/desktop/src-tauri/src/lib.rs)
  - arranca la app Tauri
  - registra los comandos invocables desde el frontend
  - inicializa el gestor de PTY

- [apps/desktop/src-tauri/src/main.rs](../apps/desktop/src-tauri/src/main.rs)
  - punto de entrada Rust para la app compilada

### 6.2 Comandos expuestos

- [apps/desktop/src-tauri/src/commands/shell.rs](../apps/desktop/src-tauri/src/commands/shell.rs)
  - ejecuta comandos shell de forma simple y devuelve stdout/stderr/exit code

- [apps/desktop/src-tauri/src/commands/pty.rs](../apps/desktop/src-tauri/src/commands/pty.rs)
  - crea, escribe, redimensiona y destruye sesiones PTY

- [apps/desktop/src-tauri/src/commands/process.rs](../apps/desktop/src-tauri/src/commands/process.rs)
  - registra y marca el fin de procesos activos

### 6.3 PTY core

- [apps/desktop/src-tauri/src/pty/manager.rs](../apps/desktop/src-tauri/src/pty/manager.rs)
  - gestor central de sesiones PTY
  - crea un shell, lee su salida y la reenvía al frontend
  - administra el estado de procesos dentro de cada sesión

- [apps/desktop/src-tauri/src/pty/process.rs](../apps/desktop/src-tauri/src/pty/process.rs)
  - define modos de proceso como stream, pager o interactive
  - sirve como base para un control más sofisticado de procesos

- [apps/desktop/src-tauri/src/pty/mod.rs](../apps/desktop/src/pty/mod.rs)
  - expone los módulos de PTY

---

## 7. Qué ya está funcionando

Actualmente el proyecto ya tiene una base sólida para una primera experiencia desktop:

- app React + Tauri arrancando correctamente,
- terminal interactiva conectada a PTY,
- sesiones de trabajo con historial,
- contexto y sugerencias inteligentes,
- panel visual para transformar output en vistas útiles,
- persistencia local de sesiones,
- UI más limpia para una ventana maximizada.

---

## 8. Qué está pendiente o mejora natural

### 8.1 Persistencia de shell real

La persistencia actual funciona a nivel de sesión y contexto, pero no replica todavía el estado completo del shell de forma completa. El siguiente salto natural sería:

- recuperar el directorio actual con más fidelidad,
- restaurar historial de comandos más completo,
- restaurar el shell con mayor precisión.

### 8.2 Mejor parsing visual

Los parsers actuales son simples y sirven como prueba de concepto. Se pueden expandir para:

- git status y git branch,
- docker compose,
- procesos más estructurados,
- métricas del sistema.

### 8.3 Inteligencia contextual más fuerte

Se puede pasar de “mostrar datos” a “dar contexto y ayuda inteligente” con reglas más ricas, por ejemplo:

- detectar workflow de desarrollo web,
- detectar errores recurrentes,
- sugerir comandos según el repositorio o stack.

### 8.4 Mejor separación de responsabilidades

La app actual está bien para un prototipo, pero podría organizarse mejor separando:

- estado global,
- terminal runtime,
- motor de contexto,
- parser visual,
- backend Tauri.

---

## 9. Ruta recomendada para seguir estudiando el proyecto

Si vas a trabajar en el proyecto, esta es una ruta lógica:

1. Leer primero la UI en [apps/desktop/src/components/AppLayout.tsx](../apps/desktop/src/components/AppLayout.tsx)
2. Luego entender el estado en [apps/desktop/src/lib/sessionState.ts](../apps/desktop/src/lib/sessionState.ts)
3. Después revisar el runtime de terminal en [apps/desktop/src/components/Terminal.tsx](../apps/desktop/src/components/Terminal.tsx)
4. Luego mirar el backend PTY en [apps/desktop/src-tauri/src/pty/manager.rs](../apps/desktop/src-tauri/src/pty/manager.rs)
5. Finalmente explorar los parsers y panel visual en [apps/desktop/src/lib/Parsers.ts](../apps/desktop/src/lib/Parsers.ts) y [apps/desktop/src/components/VisualPanel.tsx](../apps/desktop/src/components/VisualPanel.tsx)

---

## 10. Resumen corto

Este proyecto ya pasó de ser un “hello world” de terminal a una base de producto real:

- terminal desktop funcional,
- sesiones con memoria,
- panel visual que transforma output en información útil,
- contexto inteligente y local-first.

La próxima frontera no es solo “hacer que corra”, sino hacer que se sienta viva, persistente y útil para el flujo diario del desarrollador.
