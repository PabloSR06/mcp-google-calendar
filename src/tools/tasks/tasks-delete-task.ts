import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from '../google-calendar-client.js';
import { z } from 'zod';

export function registerTasksDeleteTask(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'tasks_delete_task',
    'Elimina una tarea de Google Tasks',
    {
      taskListId: z.string().describe('ID de la lista de tareas'),
      taskId: z.string().describe('ID de la tarea a eliminar'),
    },
    async (args) => {
      try {
        const { taskListId, taskId } = args;

        await googleClient.deleteTask(taskListId, taskId);

        return {
          content: [
            {
              type: 'text',
              text: `Tarea ${taskId} eliminada exitosamente de la lista ${taskListId}`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return {
          content: [
            {
              type: 'text',
              text: `Error al eliminar tarea: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
