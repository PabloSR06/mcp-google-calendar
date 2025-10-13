import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from './google-calendar.js';
import { z } from 'zod';

export function registerGoogleGetCurrentDatetime(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'google_get_current_datetime',
    'Obtiene la fecha y hora actual en formato ISO 8601. Útil para referencias temporales al crear o buscar eventos.',
    {
      timezone: z.string().optional().describe('Zona horaria en formato IANA (ej: America/New_York, Europe/Madrid). Por defecto usa Atlantic/Canary.'),
    },
    async (args) => {
      try {
        const { timezone = 'Atlantic/Canary' } = args;

        const now = new Date();
        
        // Información básica
        const isoString = now.toISOString();
        const timestamp = now.getTime();
        
        // Si se proporciona una zona horaria, formatear en esa zona
        let localTime;
        let formattedTime;
        
        try {
          localTime = now.toLocaleString('es-ES', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });
          
          formattedTime = now.toLocaleString('es-ES', {
            timeZone: timezone,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });
        } catch {
          return {
            content: [
              {
                type: 'text',
                text: `Error: Zona horaria inválida '${timezone}'. Usa formato IANA (ej: America/New_York, Europe/Madrid, Atlantic/Canary)`,
              },
            ],
            isError: true,
          };
        }

        const result = {
          iso8601: isoString,
          timestamp: timestamp,
          timezone: timezone,
          localTime: localTime,
          formatted: formattedTime,
          unix: Math.floor(timestamp / 1000),
          date: {
            year: now.getUTCFullYear(),
            month: now.getUTCMonth() + 1,
            day: now.getUTCDate(),
          },
          time: {
            hour: now.getUTCHours(),
            minute: now.getUTCMinutes(),
            second: now.getUTCSeconds(),
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error al obtener la fecha y hora actual: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
