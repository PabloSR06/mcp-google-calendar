import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from '../google-calendar-client.js';
import { z } from 'zod';
import { validateAndNormalizeDate } from '../utils/date-validation.js';

export function registerGoogleListEvents(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'calendar_list_events',
    'Lista eventos de un calendario de Google Calendar',
    {
      calendarId: z.string().optional().describe('ID del calendario (por defecto: primary)'),
      timeMin: z.string().optional().describe('Fecha/hora mínima en formato ISO 8601 Zulu time (ej: 2023-12-01T00:00:00Z).'),
      timeMax: z.string().optional().describe('Fecha/hora máxima en formato ISO 8601 Zulu time (ej: 2023-12-31T23:59:59Z).'),
      maxResults: z.number().optional().describe('Número máximo de resultados (por defecto: 10)'),
    },
    async (args) => {
      try {
        const {
          calendarId = 'primary',
          timeMin,
          timeMax,
          maxResults = 10,
        } = args;

        const normalizedTimeMin = timeMin ? validateAndNormalizeDate(timeMin) : undefined;
        const normalizedTimeMax = timeMax ? validateAndNormalizeDate(timeMax) : undefined;

        const events = await googleClient.listEvents(
          calendarId,
          normalizedTimeMin,
          normalizedTimeMax,
          maxResults
        );

        const data = events.map((event) => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          location: event.location,
          start: event.start,
          end: event.end,
          status: event.status,
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
              text: `Error al listar eventos: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
