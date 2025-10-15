import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from '../google-calendar-client.js';
import { z } from 'zod';

export function registerTasksListTasks(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'tasks_list_tasks',
    'Lista todas las tareas de una lista de tareas específica en Google Tasks',
    {
      taskListId: z.string().describe('ID de la lista de tareas (usa tasks_list_task_lists para obtenerlo)'),
      showCompleted: z.boolean().optional().describe('Mostrar tareas completadas (por defecto: true)'),
      maxResults: z.number().optional().describe('Número máximo de resultados (por defecto: 100)'),
    },
    async (args) => {
      try {
        const {
          taskListId,
          showCompleted = true,
          maxResults = 100,
        } = args;

        const tasks = await googleClient.listTasks(
          taskListId,
          showCompleted,
          maxResults
        );

        const data = tasks.map((task) => ({
          id: task.id,
          title: task.title,
          notes: task.notes,
          status: task.status,
          due: task.due,
          completed: task.completed,
          updated: task.updated,
          parent: task.parent,
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
              text: `Error al listar tareas: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
