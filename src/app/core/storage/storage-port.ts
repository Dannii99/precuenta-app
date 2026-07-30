/** Puerto de almacenamiento abstracto para persistencia local. */
export interface StoragePort<T> {
  /** Carga un valor desde storage. Retorna `null` si la clave no existe o hay error de parseo. */
  load(key: string): T | null;

  /** Guarda un valor serializado en storage. */
  save(key: string, data: T): void;

  /** Elimina una clave del storage. */
  clear(key: string): void;
}
