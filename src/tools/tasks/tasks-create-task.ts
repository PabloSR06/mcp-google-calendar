import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from '../google-calendar-client.js';
import { z } from 'zod';

export function registerTasksCreateTask(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'tasks_create_task',
    'Crea una nueva tarea en Google Tasks',
    {
      taskListId: z.string().describe('ID de la lista de tareas (usa tasks_list_task_lists para obtenerlo)'),
      title: z.string().describe('Título de la tarea'),
      notes: z.string().optional().describe('Notas o descripción de la tarea'),
      due: z.string().optional().describe('Fecha de vencimiento en formato ISO (ej: 2023-12-31T23:59:59Z)'),
    },
    async (args) => {
      try {
        const {
          taskListId,
          title,
          notes,
          due,
        } = args;

        const task = {
          title,
          notes,
          due,
          status: 'needsAction' as const,
        };

        const createdTask = await googleClient.createTask(taskListId, task);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: createdTask.id,
                title: createdTask.title,
                notes: createdTask.notes,
                status: createdTask.status,
                due: createdTask.due,
                created: createdTask.updated,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return {
          content: [
            {
              type: 'text',
              text: `Error al crear tarea: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
