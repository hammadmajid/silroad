---
applyTo: '**'
---
# Silroad

An event organizer platform that helps organizations create, manage, and promote events while connecting people through shared experiences.

## Features

- **Event Management**: Create and manage events with RSVP functionality
- **Organization System**: Organizations can host multiple events and manage members
- **User Authentication**: Secure registration and login system with session management
- **Event Discovery**: Explore events happening in your area
- **Member Management**: Handle organization memberships and event organizers
- **RSVP System**: Attendee management with capacity limits and RSVP deadlines

## Tech Stack

- **Frontend**: SvelteKit (Svetle 5) with Skeleton UI + Tailwind CSS
- **Backend**: Cloudflare Workers for serverless hosting
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM + Cloudflare KV

## Database Schema

The platform includes the following main entities:

- **Users**: User accounts with authentication
- **Organizations**: Event hosting organizations
- **Events**: Event details, dates, and capacity management
- **Attendees**: RSVP tracking
- **Sessions**: User session management

### Development

Start the development server:

```sh
pnpm dev
```

The app will be available at `http://localhost:5173`

### Database Management

Generate database migrations:

```sh
pnpm db:generate
```

Apply migrations:

```sh
pnpm db:migrate
```

### Building and Testing

Build for production:

```sh
pnpm build
```

Run unit tests:

```sh
pnpm test:unit
```

Run end-to-end tests:

```sh
pnpm test:e2e
```

Run all tests:

```sh
pnpm test
```

## Project Structure

```text
src/
├── lib/
│   ├── db/           # Database schema and connection
│   ├── repos/        # Data access layer
│   └── utils/        # Utility functions
├── routes/
│   ├── (auth)/       # Authentication pages
│   ├── explore/      # Event and org explore page
│   ├── settings/     # Nested User/org settings
│   ├── org/[org]/    # Org pages
│   ├── event/[event] # Event pages
│   └── api/          # API endpoints
└── app.html          # Main HTML template
```
