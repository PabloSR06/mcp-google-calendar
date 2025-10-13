#!/usr/bin/env node

import "dotenv/config"
import { google } from 'googleapis';
import { createServer } from 'http';
import { parse } from 'url';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL = 'http://localhost:8080/oauth/callback' } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET required in .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
  prompt: 'consent',
});

console.log('Google Calendar OAuth Setup\n');

const server = createServer(async (req, res) => {
  const { pathname, query } = parse(req.url || '', true);
  
  if (pathname !== '/oauth/callback') {
    res.writeHead(404).end('Not found');
    return;
  }

  if (!query.code) {
    res.writeHead(400).end('Authorization code missing');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(query.code);
    
    console.log('\nAuthorization successful!');
    console.log('\nAdd this to your .env file:');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    
    res.writeHead(200, {'Content-Type': 'text/html'}).end(`
      <html><body style="text-align: center; margin-top: 50px;">
        <h2>Success!</h2>
        <p>You can close this window now.</p>
      </body></html>
    `);
    
    setTimeout(() => {
      server.close();
      process.exit(0);
    }, 2000);
  } catch (err) {
    console.error('Error getting tokens:', err.message);
    res.writeHead(500).end('Error getting tokens');
  }
});

server.listen(8080, () => {
  console.log('Visit this URL to authorize:\n');
  console.log(authUrl + '\n');
});

process.on('SIGINT', () => {
  console.log('\n\nCancelled');
  server.close();
  process.exit(0);
});
