import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient, createSimpleEvent } from '../google-calendar-client.js';
import { z } from 'zod';

export function registerGoogleCreateEvent(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'calendar_create_event',
    'Crea un nuevo evento en Google Calendar',
    {
      calendarId: z.string().optional().describe('ID del calendario (por defecto: primary)'),
      title: z.string().describe('Título del evento'),
      start: z.string().describe('Fecha/hora de inicio en formato ISO 8601 Zulu time (ej: 2023-12-01T10:00:00Z).'),
      end: z.string().describe('Fecha/hora de fin en formato ISO 8601 Zulu time (ej: 2023-12-01T11:00:00Z).'),
      description: z.string().optional().describe('Descripción del evento (opcional)'),
      location: z.string().optional().describe('Ubicación del evento (opcional)'),
      attendees: z.array(z.string().email()).optional().describe('Lista de emails de los invitados (opcional)'),
      timeZone: z.string().optional().describe('Zona horaria en formato IANA (ej: America/New_York, Atlantic/Canary). Por defecto usa DEFAULT_TIMEZONE del .env. Esta zona se usa para interpretar la hora Zulu en el calendario'),
    },
    async (args) => {
      try {
        const {
          calendarId = 'primary',
          title,
          start,
          end,
          description,
          location,
          attendees,
          timeZone,
        } = args;

        if (!title || !start || !end) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: title, start y end son requeridos',
              },
            ],
            isError: true,
          };
        }

        const event = createSimpleEvent(title, start, end, description, location, attendees, timeZone);
        const createdEvent = await googleClient.createEvent(calendarId, event);

        let successMessage = `Evento creado exitosamente:\nID: ${createdEvent.id}\nTítulo: ${createdEvent.summary}\nInicio: ${createdEvent.start?.dateTime}\nFin: ${createdEvent.end?.dateTime}`;
        
        if (attendees && attendees.length > 0) {
          successMessage += `\nInvitados: ${attendees.join(', ')}`;
        }

        return {
          content: [
            {
              type: 'text',
              text: successMessage,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return {
          content: [
            {
              type: 'text',
              text: `Error al crear evento: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
