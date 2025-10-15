import { google } from 'googleapis';
import { calendar_v3 } from 'googleapis';
import type { OAuth2Client } from 'googleapis-common';

interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUrl?: string;
  refreshToken?: string;
}

export class GoogleCalendarClient {
  private auth: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  constructor(config: GoogleCalendarConfig) {
    this.auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      'http://localhost:8080/oauth/callback'
    ) as OAuth2Client;

    if (config.refreshToken) {
      this.auth.setCredentials({
        refresh_token: config.refreshToken,
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  /**
   * Genera URL de autorización para obtener el token inicial
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  /**
   * Intercambia el código de autorización por tokens
   */
  async getTokens(code: string): Promise<{
    refresh_token?: string | null;
    access_token?: string | null;
    token_type?: string | null;
    expiry_date?: number | null;
  }> {
    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);
    return tokens;
  }

  /**
   * Lista todos los calendarios del usuario
   */
  async listCalendars(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error al listar calendarios:', error);
      throw error;
    }
  }

  /**
   * Lista eventos de un calendario específico
   */
  async listEvents(
    calendarId: string = 'primary',
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 10
  ): Promise<calendar_v3.Schema$Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Error al listar eventos:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo evento
   */
  async createEvent(
    calendarId: string = 'primary',
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear evento:', error);
      throw error;
    }
  }

  /**
   * Actualiza un evento existente
   */
  async updateEvent(
    calendarId: string = 'primary',
    eventId: string,
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw error;
    }
  }

  /**
   * Elimina un evento
   */
  async deleteEvent(
    calendarId: string = 'primary',
    eventId: string
  ): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      throw error;
    }
  }

  /**
   * Busca eventos por texto
   */
  async searchEvents(
    calendarId: string = 'primary',
    query: string,
    maxResults: number = 10
  ): Promise<calendar_v3.Schema$Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        q: query,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Error al buscar eventos:', error);
      throw error;
    }
  }
}

/**
 * Función helper para crear eventos con formato simplificado
 */
export function createSimpleEvent(
  title: string,
  start: string,
  end: string,
  description?: string,
  location?: string,
  attendees?: string[]
): calendar_v3.Schema$Event {
  const event: calendar_v3.Schema$Event = {
    summary: title,
    description,
    location,
    start: {
      dateTime: start,
      timeZone: 'America/Mexico_City', // Ajusta según tu zona horaria
    },
    end: {
      dateTime: end,
      timeZone: 'America/Mexico_City',
    },
  };

  if (attendees && attendees.length > 0) {
    event.attendees = attendees.map(email => ({
      email: email.trim(),
      responseStatus: 'needsAction'
    }));
  }

  return event;
}
