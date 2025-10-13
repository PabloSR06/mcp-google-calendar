import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleCalendarClient } from './google-calendar.js';
import { registerGoogleListCalendars } from './google-list-calendars.js';
import { registerGoogleListEvents } from './google-list-events.js';
import { registerGoogleCreateEvent } from './google-create-event.js';
import { registerGoogleUpdateEvent } from './google-update-event.js';
import { registerGoogleDeleteEvent } from './google-delete-event.js';
import { registerGoogleSearchEvents } from './google-search-events.js';
import { registerGoogleGetCurrentDatetime } from './google-get-current-datetime.js';

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
