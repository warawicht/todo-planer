# Todo Planer Frontend

This is the frontend for the Todo Planer application, a task and time management system built with React, TypeScript, and Tailwind CSS.

## Features

- User authentication (login, registration, password reset)
- Calendar views (day, week, month)
- Dashboard with productivity widgets
- Time blocking functionality
- Responsive design
- Progressive Web App (PWA) support

## Tech Stack

- **Framework**: React with TypeScript
- **State Management**: React Context API
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Testing**: Jest and React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm run frontend:dev
   ```

3. Build for production:
   ```bash
   pnpm run frontend:build
   ```

4. Preview production build:
   ```bash
   pnpm run frontend:preview
   ```

## Project Structure

```
frontend/
├── components/     # React components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── services/       # API service layer
├── types/          # TypeScript types
├── utils/          # Utility functions
├── index.html      # HTML entry point
├── index.tsx       # React entry point
└── App.tsx         # Main App component
```

## Available Scripts

- `pnpm run frontend:dev` - Start development server
- `pnpm run frontend:build` - Build for production
- `pnpm run frontend:preview` - Preview production build
- `pnpm run test:frontend` - Run frontend tests

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:3000
```

## Development

The frontend is designed to work with the backend API. Make sure the backend server is running on the specified port.

## Testing

Run frontend tests with:
```bash
pnpm run test:frontend
```