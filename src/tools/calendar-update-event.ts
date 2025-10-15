import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from './google-calendar.js';
import { z } from 'zod';
import { calendar_v3 } from 'googleapis';

export function registerGoogleUpdateEvent(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'calendar_update_event',
    'Actualiza un evento existente en Google Calendar',
    {
      calendarId: z.string().optional().describe('ID del calendario (por defecto: primary)'),
      eventId: z.string().describe('ID del evento a actualizar'),
      title: z.string().optional().describe('Nuevo título del evento'),
      start: z.string().optional().describe('Nueva fecha/hora de inicio en formato ISO (ej: 2023-12-01T10:00:00Z)'),
      end: z.string().optional().describe('Nueva fecha/hora de fin en formato ISO'),
      description: z.string().optional().describe('Nueva descripción del evento'),
      location: z.string().optional().describe('Nueva ubicación del evento'),
      attendees: z.array(z.string().email()).optional().describe('Lista de emails de los invitados (opcional)'),
    },
    async (args) => {
      try {
        const {
          calendarId = 'primary',
          eventId,
          title,
          start,
          end,
          description,
          location,
          attendees,
        } = args;

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

        // Construir el objeto de evento con solo los campos proporcionados
        const event: calendar_v3.Schema$Event = {};
        
        if (title !== undefined) {
          event.summary = title;
        }
        
        if (description !== undefined) {
          event.description = description;
        }
        
        if (location !== undefined) {
          event.location = location;
        }
        
        if (start !== undefined) {
          event.start = {
            dateTime: start,
            timeZone: process.env.DEFAULT_TIMEZONE || 'America/New_York',
          };
        }
        
        if (end !== undefined) {
          event.end = {
            dateTime: end,
            timeZone: process.env.DEFAULT_TIMEZONE || 'America/New_York',
          };
        }

        if (attendees !== undefined) {
          event.attendees = attendees.map(email => ({
            email: email.trim(),
            responseStatus: 'needsAction'
          }));
        }

        const updatedEvent = await googleClient.updateEvent(calendarId, eventId, event);

        let successMessage = `Evento actualizado exitosamente:\nID: ${updatedEvent.id}\nTítulo: ${updatedEvent.summary}\nInicio: ${updatedEvent.start?.dateTime}\nFin: ${updatedEvent.end?.dateTime}`;
        
        if (attendees !== undefined && attendees.length > 0) {
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
              text: `Error al actualizar evento: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
