// Definimos una especie de "enum moderno" usando un objeto.
//
// "as const" le dice a TypeScript:
//
// "Estos valores son constantes literales.
// No los conviertas simplemente en string."
//
// Sin "as const", TypeScript vería:
//
// TEXT: string
//
// Con "as const", ve:
//
// TEXT: "TEXT"
//
// Esto permite obtener tipos más precisos.
export const CommandType = {

  // Comando normal de texto.
  // Ejemplo:
  // help
  // hello
  // cualquier texto libre
  TEXT: 'TEXT',

  // Comandos relacionados con información del sistema.
  // Ejemplo:
  // ps
  // env
  // top
  SYSTEM: 'SYSTEM',

  // Comandos relacionados con navegación de archivos.
  // Ejemplo:
  // cd
  // ls
  // tree
  NAVIGATION: 'NAVIGATION',

  // Comandos que generan paneles visuales.
  // Ejemplo:
  // git log
  // docker ps
  VISUAL: 'VISUAL',

} as const;



// Creamos automáticamente un tipo a partir del objeto anterior.
//
// Resultado:
//
// type CommandType =
//   | "TEXT"
//   | "SYSTEM"
//   | "NAVIGATION"
//   | "VISUAL"
//
// Esto evita duplicar información.
//
// Si agregas:
//
// DATABASE: "DATABASE"
//
// el tipo se actualiza automáticamente.
export type CommandType =
  (typeof CommandType)[keyof typeof CommandType];



/**
 * Analiza un comando escrito por el usuario
 * y determina a qué categoría pertenece.
 *
 * Ejemplos:
 *
 * "git log"
 * -> VISUAL
 *
 * "cd src"
 * -> NAVIGATION
 *
 * "top"
 * -> SYSTEM
 */
export function classifyCommand(input: string): CommandType {

  // Eliminamos espacios al principio y al final.
  //
  // "   git log   "
  //
  // pasa a:
  //
  // "git log"
  const trimmed = input.trim();

  // Si el usuario no escribió nada,
  // devolvemos TEXT por defecto.
  if (!trimmed) return CommandType.TEXT;

  // Tomamos solamente la primera palabra.
  //
  // "git log --oneline"
  //
  // split(' ')
  //
  // ["git", "log", "--oneline"]
  //
  // [0]
  //
  // "git"
  //
  // toLowerCase()
  //
  // "GIT" -> "git"
  const cmd = trimmed
    .split(' ')[0]
    .toLowerCase();



  // Comandos que generan visualizaciones.
  //
  // Más adelante podrían abrir paneles,
  // gráficos o timelines.
  const visualCommands = [
    'git',
    'docker',
    'npm',
    'yarn',
    'pnpm',
    'ls',
    'dir'
  ];

  // Comandos relacionados con navegación
  // de archivos y carpetas.
  const navigationCommands = [
    'cd',
    'tree'
  ];



  // Comandos relacionados con el sistema operativo.
  const systemCommands = [
    'ipconfig',
    'ps',
    'env',
    'top'
  ];



  // ¿Está dentro de los comandos visuales?
  //
  // Ejemplo:
  //
  // cmd = "git"
  //
  // devuelve:
  //
  // VISUAL
  if (visualCommands.includes(cmd)) {
    return CommandType.VISUAL;
  }



  // ¿Es un comando de navegación?
  //
  // Ejemplo:
  //
  // cmd = "cd"
  //
  // devuelve:
  //
  // NAVIGATION
  if (navigationCommands.includes(cmd)) {
    return CommandType.NAVIGATION;
  }



  // ¿Es un comando de sistema?
  //
  // Ejemplo:
  //
  // cmd = "top"
  //
  // devuelve:
  //
  // SYSTEM
  if (systemCommands.includes(cmd)) {
    return CommandType.SYSTEM;
  }



  // Si no coincide con ninguna categoría,
  // asumimos que es texto normal.
  return CommandType.TEXT;
}



// ------------------------------------------------------------------
// EVENTOS PERSONALIZADOS
// ------------------------------------------------------------------



// Describe la estructura de datos que viajará
// dentro del evento:
//
// visual-command-start
//
// Ejemplo:
//
// {
//   command: "git log"
// }
export interface VisualCommandStartEvent {

  // Comando ejecutado por el usuario.
  command: string;
}



// ------------------------------------------------------------------
// EXTENSIÓN GLOBAL DE WINDOW
// ------------------------------------------------------------------



// "declare global" permite agregar nuevos tipos
// al entorno global de TypeScript.
//
// Aquí estamos enseñándole a TypeScript
// que existen eventos personalizados.
declare global {

  interface WindowEventMap {

    // Evento disparado cuando comienza
    // un comando visual.
    //
    // Ejemplo:
    //
    // window.dispatchEvent(
    //   new CustomEvent(
    //     "visual-command-start",
    //     {
    //       detail: {
    //         command: "git log"
    //       }
    //     }
    //   )
    // )
    'visual-command-start':
      CustomEvent<VisualCommandStartEvent>;



    // Evento para cambiar el modo
    // de funcionamiento de la terminal.
    //
    // detail.mode puede ser:
    //
    // "text"
    // o
    // "hybrid"
    //
    'terminal-mode-switch':
      CustomEvent<{
        mode: 'text' | 'hybrid';
      }>;
  }
}