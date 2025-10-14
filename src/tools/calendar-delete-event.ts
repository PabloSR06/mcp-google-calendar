import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from './google-calendar.js';
import { z } from 'zod';

export function registerGoogleDeleteEvent(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'calendar_delete_event',
    'Elimina un evento de Google Calendar',
    {
      calendarId: z.string().optional().describe('ID del calendario (por defecto: primary)'),
      eventId: z.string().describe('ID del evento a eliminar'),
    },
    async (args) => {
      try {
        const { calendarId = 'primary', eventId } = args;

        if (!eventId) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: eventId es requerido',
              },
            ],
            isError: true,
          };
        }

        await googleClient.deleteEvent(calendarId, eventId);

        return {
          content: [
            {
              type: 'text',
              text: `Evento ${eventId} eliminado exitosamente`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return {
          content: [
            {
              type: 'text',
              text: `Error al eliminar evento: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
