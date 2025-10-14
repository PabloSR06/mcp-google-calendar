import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from './google-calendar.js';
import { registerGoogleListCalendars } from './calendar-list-calendars.js';
import { registerGoogleListEvents } from './calendar-list-events.js';
import { registerGoogleCreateEvent } from './calendar-create-event.js';
import { registerGoogleUpdateEvent } from './calendar-update-event.js';
import { registerGoogleDeleteEvent } from './calendar-delete-event.js';
import { registerGoogleSearchEvents } from './calendar-search-events.js';
import { registerGoogleGetCurrentDatetime } from './calendar-get-current-datetime.js';

export function registerGoogleCalendarTools(
  googleClient: GoogleCalendarClient,
  server: McpServer
) {
  registerGoogleListCalendars(googleClient, server);
  registerGoogleListEvents(googleClient, server);
  registerGoogleCreateEvent(googleClient, server);
  registerGoogleUpdateEvent(googleClient, server);
  registerGoogleDeleteEvent(googleClient, server);
  registerGoogleSearchEvents(googleClient, server);
  registerGoogleGetCurrentDatetime(googleClient, server);
}
