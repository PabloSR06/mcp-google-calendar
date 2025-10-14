import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from './google-calendar.js';
import { z } from 'zod';

export function registerGoogleSearchEvents(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'calendar_search_events',
    'Busca eventos en Google Calendar por texto',
    {
      calendarId: z.string().optional().describe('ID del calendario (por defecto: primary)'),
      query: z.string().describe('Texto a buscar en los eventos'),
      maxResults: z.number().optional().describe('Número máximo de resultados (por defecto: 10)'),
    },
    async (args) => {
      try {
        const {
          calendarId = 'primary',
          query,
          maxResults = 10,
        } = args;

        if (!query) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: query es requerido',
              },
            ],
            isError: true,
          };
        }

        const events = await googleClient.searchEvents(calendarId, query, maxResults);

        const data = events.map((event) => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          location: event.location,
          start: event.start,
          end: event.end,
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
              text: `Error al buscar eventos: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
