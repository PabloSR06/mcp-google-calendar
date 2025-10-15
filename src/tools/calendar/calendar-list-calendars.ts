import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from '../google-calendar-client.js';

export function registerGoogleListCalendars(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'calendar_list_calendars',
    'Lista todos los calendarios disponibles en Google Calendar',
    async () => {
      try {
        const calendars = await googleClient.listCalendars();
        const data = calendars.map((cal) => ({
          id: cal.id,
          summary: cal.summary,
          description: cal.description,
          timeZone: cal.timeZone,
          accessRole: cal.accessRole,
        }));
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return {
          content: [
            {
              type: 'text',
              text: `Error al listar calendarios: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
