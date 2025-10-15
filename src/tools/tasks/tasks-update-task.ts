import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from '../google-calendar-client.js';
import { z } from 'zod';

export function registerTasksUpdateTask(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  server.tool(
    'tasks_update_task',
    'Actualiza una tarea existente en Google Tasks',
    {
      taskListId: z.string().describe('ID de la lista de tareas'),
      taskId: z.string().describe('ID de la tarea a actualizar'),
      title: z.string().optional().describe('Nuevo título de la tarea'),
      notes: z.string().optional().describe('Nuevas notas o descripción de la tarea'),
      due: z.string().optional().describe('Nueva fecha de vencimiento en formato ISO (ej: 2023-12-31T23:59:59Z)'),
      status: z.enum(['needsAction', 'completed']).optional().describe('Estado de la tarea'),
    },
    async (args) => {
      try {
        const {
          taskListId,
          taskId,
          title,
          notes,
          due,
          status,
        } = args;

        const task: any = {};
        if (title !== undefined) task.title = title;
        if (notes !== undefined) task.notes = notes;
        if (due !== undefined) task.due = due;
        if (status !== undefined) {
          task.status = status;
          if (status === 'completed') {
            task.completed = new Date().toISOString();
          }
        }

        const updatedTask = await googleClient.updateTask(taskListId, taskId, task);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: updatedTask.id,
                title: updatedTask.title,
                notes: updatedTask.notes,
                status: updatedTask.status,
                due: updatedTask.due,
                completed: updatedTask.completed,
                updated: updatedTask.updated,
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
              text: `Error al actualizar tarea: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
