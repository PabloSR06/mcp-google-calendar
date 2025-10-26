#!/usr/bin/env node

import "dotenv/config"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { GoogleCalendarClient } from "./tools/google-calendar-client.js"
import { registerGoogleCalendarTools } from "./tools/google-calendar-mcp.js"

const server = new McpServer({
  name: "mcp-google-calendar",
  version: "1.1.2",
})

async function main() {
  console.error('Configurando Google Calendar API...')
  
  // Verificar que las credenciales de Google estén configuradas
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Error: GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET son requeridos')
    process.exit(1)
  }

  const googleClient = new GoogleCalendarClient({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  })

  // Si no tenemos refresh token, mostrar URL de autorización
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    console.error('\n🔑 AUTORIZACIÓN REQUERIDA')
    console.error('Visita la siguiente URL para autorizar la aplicación:')
    console.error(googleClient.getAuthUrl())
    console.error('\nDespués de autorizar, agrega el refresh_token al archivo .env como GOOGLE_REFRESH_TOKEN=...\n')
    process.exit(1)
  }

  registerGoogleCalendarTools(googleClient, server)
  console.log('Google Calendar configurado correctamente')

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  console.error('Error al iniciar el servidor:', error)
  process.exit(1)
})
