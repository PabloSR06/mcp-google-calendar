# mcp-google-calendar


A Google Calendar and Google Tasks (MCP) server to expose calendar and task operations as tools for LLM.


## Table of Contents

- [mcp-google-calendar](#mcp-google-calendar)
  - [Table of Contents](#table-of-contents)
  - [Important: Authentication Architecture](#important-authentication-architecture)
    - [Current Implementation](#current-implementation)
    - [Multi-User Scenarios](#multi-user-scenarios)
  - [Setup](#setup)
    - [Prerequisites](#prerequisites)
    - [Step-by-step Configuration](#step-by-step-configuration)
      - [1. Configure Google Cloud Console Project](#1-configure-google-cloud-console-project)
      - [2. Create OAuth 2.0 Credentials](#2-create-oauth-20-credentials)
      - [3. Configure the .env file](#3-configure-the-env-file)
      - [4. Get the refresh token](#4-get-the-refresh-token)
      - [5. Test the configuration](#5-test-the-configuration)
    - [MCP Client Configuration](#mcp-client-configuration)
  - [Usage](#usage)
  - [Testing with MCP Inspector](#testing-with-mcp-inspector)
  - [Timezone Configuration](#timezone-configuration)
  - [Security](#security)
  - [Additional Resources](#additional-resources)
  - [Available Tools](#available-tools)
    - [Calendar Tools](#calendar-tools)
      - [calendar-create-event](#calendar-create-event)
      - [calendar-update-event](#calendar-update-event)
      - [calendar-list-events](#calendar-list-events)
      - [calendar-search-events](#calendar-search-events)
      - [calendar-delete-event](#calendar-delete-event)
      - [calendar-list-calendars](#calendar-list-calendars)
      - [calendar-get-current-datetime](#calendar-get-current-datetime)
    - [Tasks Tools](#tasks-tools)
      - [tasks-list-task-lists](#tasks-list-task-lists)
      - [tasks-list-tasks](#tasks-list-tasks)
      - [tasks-create-task](#tasks-create-task)
      - [tasks-update-task](#tasks-update-task)
      - [tasks-delete-task](#tasks-delete-task)
  - [License](#license)


## Important: Authentication Architecture

**This MCP server is configured to use a single Google account for all operations.** The authentication credentials (client ID, client secret, and refresh token) are stored in environment variables (`.env` file), meaning all users of this MCP server will interact with the same Google Calendar and Google Tasks account.

### Current Implementation
- **Single Account Mode**: One Google account's credentials are configured in the `.env` file
- **All operations** (create, read, update, delete events and tasks) are performed on this single account
- **Best for**: Personal use, single-user applications, or shared team calendars and task lists

### Multi-User Scenarios
If you need **each user to authenticate with their own Google account**, this server would require modifications:

1. **Add user authentication layer**: Implement a user authentication system (OAuth2, sessions, JWT, etc.)
2. **Pass user context**: Modify the MCP tools to use the authenticated user's token instead of the `.env` token
3. **Token refresh logic**: Implement per-user token refresh and management

> **Note**: The current implementation prioritizes simplicity for personal use.


## Setup

### Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. Node.js installed

### Step-by-step Configuration

#### 1. Configure Google Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the required APIs:
   - **Google Calendar API**: Go to "APIs & Services" > "Library", search for "Google Calendar API" and click "Enable"
   - **Google Tasks API**: Go to "APIs & Services" > "Library", search for "Google Tasks API" and click "Enable"

#### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. If it's your first time, configure the OAuth consent screen:
   - Select "External" (or "Internal" if you have Google Workspace)
   - Complete the basic app information
   - In "Scopes", don't add any scope (we'll do this programmatically)
   - Add your email as a test user
4. Create the OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "Google Calendar MCP Server"
   - Authorized redirect URIs: `http://localhost:8080/oauth/callback`

#### 3. Configure the .env file

1. Copy the credentials from Google Cloud Console
2. Create a `.env` file in the project root:

```bash
# Google Cloud Console credentials
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# This will be generated in the next step
GOOGLE_REFRESH_TOKEN=

# Default timezone for calendar operations
DEFAULT_TIMEZONE=Atlantic/Canary
```

#### 4. Get the refresh token

Run the setup script:

```bash
npm run setup:google
```

This script will:
1. Start a temporary server on port 8080
2. Show you a URL to authorize the application
3. Open that URL in your browser
4. After authorizing, give you a `refresh_token`
5. Return token `GOOGLE_REFRESH_TOKEN`

#### 5. Test the configuration

```bash
npm run build
node dist/index.js
```


### MCP Client Configuration

Add this to your MCP client configuration (e.g., Claude Desktop config):

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      //WIP: "args": ["mcp-google-calendar"],
      "env": {
        "GOOGLE_CLIENT_ID": "<your-client-id>",
        "GOOGLE_CLIENT_SECRET": "<your-client-secret>",
        "GOOGLE_REFRESH_TOKEN": "<your-refresh-token>",
        "DEFAULT_TIMEZONE": "Atlantic/Canary"
      }
    }
  }
}
```

## Usage

1. Compile TypeScript to JavaScript:
```bash
npm run build
```

2. Run the MCP server:
```bash
node dist/index.js
```

## Testing with MCP Inspector

You can test and debug this MCP server using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

1. Make sure you have built the project:
```bash
npm run build
```

2. Set up your environment variables in `.env` file:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
DEFAULT_TIMEZONE=Atlantic/Canary
```

3. Update `mcp-inspector-config.json` with your project path:
```json
{
  "mcpServers": {
    "mcp-google-calendar": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
        "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}",
        "GOOGLE_REFRESH_TOKEN": "${GOOGLE_REFRESH_TOKEN}",
        "DEFAULT_TIMEZONE": "${DEFAULT_TIMEZONE}"
      }
    }
  }
}
```

4. Run the MCP Inspector:
```bash
npx @modelcontextprotocol/inspector --config mcp-inspector-config.json
```

1. Open your browser to the URL shown in the terminal (default should be http://localhost:6277) to interact with the MCP server through the Inspector UI.


## Timezone Configuration

This MCP server supports flexible timezone configuration:

1. **Default Timezone**: Set `DEFAULT_TIMEZONE` in your `.env` file using IANA timezone format (e.g., `Atlantic/Canary`, `America/New_York`, `Asia/Tokyo`)
2. **Per-Operation Override**: When creating or updating events, you can specify a different timezone for that specific operation
3. **Fallback**: If no timezone is configured, the server defaults to `Atlantic/Canary`

**Timezone Priority:**
1. Timezone parameter passed to the tool (highest priority)
2. `DEFAULT_TIMEZONE` environment variable from `.env`
3. Hardcoded default: `Atlantic/Canary` (lowest priority)

**Common IANA Timezones:**
- Europe: `Atlantic/Canary`, `Europe/London`, `Europe/Paris`, `Europe/Berlin`
- Americas: `America/New_York`, `America/Chicago`, `America/Los_Angeles`, `America/Mexico_City`
- Asia: `Asia/Tokyo`, `Asia/Shanghai`, `Asia/Dubai`, `Asia/Kolkata`
- Other: `Atlantic/Canary`, `Pacific/Auckland`, `Australia/Sydney`

## Security

- **Never** share your `client_secret` or `refresh_token`
- Add `.env` to your `.gitignore` (already included)
- Tokens have limited permissions only for Google Calendar and Google Tasks

## Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Google Tasks API Documentation](https://developers.google.com/tasks)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)

## Available Tools

### Calendar Tools

#### calendar-create-event

Creates a new calendar event in Google Calendar.

Parameters:
- `title`: String - Event title/summary
- `start`: DateTime string - Event start time (ISO 8601 format)
- `end`: DateTime string - Event end time (ISO 8601 format)
- `description`: String (optional) - Event description
- `location`: String (optional) - Event location
- `attendees`: Array of email strings (optional) - List of attendee email addresses
- `timeZone`: String (optional) - Timezone in IANA format (e.g., Atlantic/Canary, America/New_York). Defaults to `DEFAULT_TIMEZONE` from .env or 'Atlantic/Canary'
- `calendarId`: String (optional) - Calendar ID (defaults to 'primary')

Returns:
- The unique ID and details of the created event

#### calendar-update-event

Updates an existing event in Google Calendar.

Parameters:
- `eventId`: String - The unique ID of the event to update
- `title`: String (optional) - New event title/summary
- `start`: DateTime string (optional) - New event start time (ISO 8601 format)
- `end`: DateTime string (optional) - New event end time (ISO 8601 format)
- `description`: String (optional) - New event description
- `location`: String (optional) - New event location
- `attendees`: Array of email strings (optional) - List of attendee email addresses
- `timeZone`: String (optional) - Timezone in IANA format (e.g., Atlantic/Canary, America/New_York). Defaults to `DEFAULT_TIMEZONE` from .env or 'Atlantic/Canary'
- `calendarId`: String (optional) - Calendar ID (defaults to 'primary')

Returns:
- The updated event details

#### calendar-list-events

Lists events within a specified timeframe from Google Calendar.

Parameters:
- `timeMin`: DateTime string (optional) - Start of the timeframe (ISO 8601 format)
- `timeMax`: DateTime string (optional) - End of the timeframe (ISO 8601 format)
- `calendarId`: String (optional) - Calendar ID (defaults to 'primary')
- `maxResults`: Number (optional) - Maximum number of events to return (default: 10)

Returns:
- A list of events that fall within the given timeframe

#### calendar-search-events

Searches for events in Google Calendar by text query.

Parameters:
- `query`: String - Search query
- `calendarId`: String (optional) - Calendar ID (defaults to 'primary')
- `maxResults`: Number (optional) - Maximum number of events to return (default: 10)

Returns:
- A list of events matching the search query

#### calendar-delete-event

Deletes an event from Google Calendar.

Parameters:
- `eventId`: String - The unique ID of the event to delete
- `calendarId`: String (optional) - Calendar ID (defaults to 'primary')

Returns:
- Confirmation of deletion

#### calendar-list-calendars

Lists all calendars available to the user.

Returns:
- A list of calendars with their IDs and names

#### calendar-get-current-datetime

Gets the current date and time in ISO 8601 format. Useful for references when creating or searching for events.

Parameters:
- `timezone`: String (optional) - Timezone in IANA format (e.g., Atlantic/Canary, America/New_York, Asia/Tokyo). Defaults to `DEFAULT_TIMEZONE` from .env or 'Atlantic/Canary'.

Returns:
- Current date and time information including ISO 8601 format, timestamp, local time, and timezone details

### Tasks Tools

#### tasks-list-task-lists

Lists all task lists available in Google Tasks.

Parameters: None

Returns:
- A list of all task lists with their IDs and titles

Example use case:
- Get the list of all your task lists to find the `taskListId` for creating or managing tasks

#### tasks-list-tasks

Lists all tasks in a specific task list.

Parameters:
- `taskListId`: String - The ID of the task list (use `tasks-list-task-lists` to get this)
- `showCompleted`: Boolean (optional) - Whether to show completed tasks (default: true)
- `maxResults`: Number (optional) - Maximum number of tasks to return (default: 100)

Returns:
- A list of tasks with details including ID, title, notes, status, due date, and completion date

#### tasks-create-task

Creates a new task in Google Tasks.

Parameters:
- `taskListId`: String - The ID of the task list where the task will be created
- `title`: String - Task title/summary
- `notes`: String (optional) - Task notes or description
- `due`: DateTime string (optional) - Due date in ISO 8601 format (e.g., "2024-12-31T23:59:59Z")

Returns:
- The created task details including ID, title, notes, status, and due date


#### tasks-update-task

Updates an existing task in Google Tasks.

Parameters:
- `taskListId`: String - The ID of the task list containing the task
- `taskId`: String - The ID of the task to update
- `title`: String (optional) - New task title
- `notes`: String (optional) - New task notes or description
- `due`: DateTime string (optional) - New due date in ISO 8601 format
- `status`: String (optional) - Task status: either "needsAction" or "completed"

Returns:
- The updated task details


#### tasks-delete-task

Deletes a task from Google Tasks.

Parameters:
- `taskListId`: String - The ID of the task list containing the task
- `taskId`: String - The ID of the task to delete

Returns:
- Confirmation message of deletion

## License

MIT
