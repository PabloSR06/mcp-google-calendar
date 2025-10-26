/**
 * Valida si una fecha está en formato ISO 8601 Zulu time (sin offset)
 * Formato esperado: YYYY-MM-DDTHH:mm:ss.sssZ o YYYY-MM-DDTHH:mm:ssZ
 * @param dateString - String de fecha a validar
 * @returns true si está en formato Zulu time, false en caso contrario
 */
export function isZuluTime(dateString: string): boolean {
  const zuluTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  return zuluTimeRegex.test(dateString);
}

/**
 * Convierte cualquier fecha ISO 8601 a Zulu time (UTC sin offset)
 * Si la fecha ya está en Zulu time, la devuelve sin cambios
 * Si la fecha tiene offset, lo elimina y convierte a UTC
 * @param dateString - String de fecha en formato ISO 8601
 * @returns String de fecha en formato Zulu time
 * @throws Error si la fecha no es válida
 */
export function convertToZuluTime(dateString: string): string {
  if (isZuluTime(dateString)) {
    return dateString;
  }

  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      throw new Error(`Fecha inválida: ${dateString}`);
    }

    return date.toISOString();
  } catch (error) {
    throw new Error(`Error al convertir fecha a Zulu time: ${dateString}. ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Valida y normaliza una fecha a formato Zulu time
 * @param dateString - String de fecha a validar y normalizar
 * @returns String de fecha en formato Zulu time
 * @throws Error si la fecha no es válida
 */
export function validateAndNormalizeDate(dateString: string): string {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('La fecha debe ser un string no vacío');
  }

  return convertToZuluTime(dateString);
}
