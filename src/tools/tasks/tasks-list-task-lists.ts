import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from '../google-calendar-client.js';
import { z } from 'zod';

export function registerTasksListTaskLists(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'tasks_list_task_lists',
    'Lista todas las listas de tareas de Google Tasks del usuario',
    {},
    async () => {
      try {
        const taskLists = await googleClient.listTaskLists();

        const data = taskLists.map((taskList) => ({
          id: taskList.id,
          title: taskList.title,
          updated: taskList.updated,
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
              text: `Error al listar listas de tareas: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
