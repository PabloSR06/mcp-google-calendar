import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from './google-calendar-client.js';
import { registerGoogleListCalendars } from './calendar/calendar-list-calendars.js';
import { registerGoogleListEvents } from './calendar/calendar-list-events.js';
import { registerGoogleCreateEvent } from './calendar/calendar-create-event.js';
import { registerGoogleUpdateEvent } from './calendar/calendar-update-event.js';
import { registerGoogleDeleteEvent } from './calendar/calendar-delete-event.js';
import { registerGoogleSearchEvents } from './calendar/calendar-search-events.js';
import { registerGoogleGetCurrentDatetime } from './calendar/calendar-get-current-datetime.js';
import { registerTasksListTaskLists } from './tasks/tasks-list-task-lists.js';
import { registerTasksListTasks } from './tasks/tasks-list-tasks.js';
import { registerTasksCreateTask } from './tasks/tasks-create-task.js';
import { registerTasksUpdateTask } from './tasks/tasks-update-task.js';
import { registerTasksDeleteTask } from './tasks/tasks-delete-task.js';

export function registerGoogleCalendarTools(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  // Calendar tools
  registerGoogleListCalendars(googleClient, server);
  registerGoogleListEvents(googleClient, server);
  registerGoogleCreateEvent(googleClient, server);
  registerGoogleUpdateEvent(googleClient, server);
  registerGoogleDeleteEvent(googleClient, server);
  registerGoogleSearchEvents(googleClient, server);
  registerGoogleGetCurrentDatetime(googleClient, server);
  
  // Tasks tools
  registerTasksListTaskLists(googleClient, server);
  registerTasksListTasks(googleClient, server);
  registerTasksCreateTask(googleClient, server);
  registerTasksUpdateTask(googleClient, server);
  registerTasksDeleteTask(googleClient, server);
}
