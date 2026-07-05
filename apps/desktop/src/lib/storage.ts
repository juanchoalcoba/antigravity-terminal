// Clave única que se utilizará para guardar y recuperar la información
// desde el localStorage del navegador.
// Si en el futuro cambias la estructura de los datos, puedes cambiar el
// nombre de la clave (por ejemplo a "v3") para evitar incompatibilidades.
const STORAGE_KEY = 'antigravity-sessions-v2';

/**
 * Carga información desde localStorage.
 *
 * <T> indica que esta función es genérica: puede devolver cualquier tipo
 * de dato (array, objeto, string, etc.) manteniendo el tipado.
 *
 * @param fallback Valor que se devolverá si ocurre algún problema
 *                 (por ejemplo, no hay datos guardados).
 * @returns Los datos almacenados o el fallback.
 */
export function loadStoredSessions<T>(fallback: T): T {

  // Verifica que el código se esté ejecutando en el navegador.
  // En SSR (Server Side Rendering) no existe "window".
  if (typeof window === 'undefined') return fallback;

  try {

    // Busca el texto almacenado bajo la clave STORAGE_KEY.
    // localStorage únicamente almacena strings.
    const raw = window.localStorage.getItem(STORAGE_KEY);

    // Si no existe nada guardado, devuelve el valor por defecto.
    if (!raw) return fallback;

    // Convierte el string JSON nuevamente en un objeto JavaScript.
    // El "as T" le dice a TypeScript que el resultado tendrá el tipo T.
    return JSON.parse(raw) as T;

  } catch {

    // Si ocurre cualquier error (JSON inválido, localStorage corrupto,
    // permisos denegados, etc.) devolvemos el fallback para evitar
    // que la aplicación se rompa.
    return fallback;
  }
}

/**
 * Guarda cualquier tipo de dato en localStorage.
 *
 * @param value Información que se desea almacenar.
 */
export function saveStoredSessions<T>(value: T): void {

  // Igual que antes, comprobamos que exista el objeto window.
  if (typeof window === 'undefined') return;

  // Convierte el objeto a texto JSON porque localStorage
  // solamente puede almacenar cadenas de texto.
  const serialized = JSON.stringify(value);

  // Guarda el string en localStorage usando la clave STORAGE_KEY.
  window.localStorage.setItem(STORAGE_KEY, serialized);
}