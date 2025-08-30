# Demo Data Creation System

## Overview

The demo data creation system provides a convenient way to populate the application with realistic sample data for testing and demonstration purposes. It creates sample users, projects, tasks, tags, and time blocks using the existing application services to ensure consistency with business logic.

## Features

- Creates 3 demo users with realistic names
- Generates projects for each user
- Creates tags for task categorization
- Generates tasks with various priorities and statuses
- Creates time blocks for scheduling
- Uses existing services to maintain data consistency
- Includes security checks to prevent accidental use in production

## Usage

### Prerequisites

Before running the demo data creation, ensure that:

1. The application is not running in a production environment (`NODE_ENV !== 'production'`)
2. Demo data creation is explicitly enabled (`ENABLE_DEMO_DATA=true`)

### Running the Demo Data Creation

To create demo data, run the following command:

```bash
npm run demo:data
```

### Environment Variables

The demo data creation system uses the following environment variables:

- `NODE_ENV`: Should not be set to 'production'
- `ENABLE_DEMO_DATA`: Must be set to 'true' to enable demo data creation

Example `.env` configuration for development:
```
NODE_ENV=development
ENABLE_DEMO_DATA=true
```

## Security

The system includes multiple security checks to prevent accidental use in production:

1. Checks that `NODE_ENV` is not set to 'production'
2. Requires `ENABLE_DEMO_DATA` to be explicitly set to 'true'

If either of these conditions is not met, the system will throw a `BadRequestException` and log a warning message.

## Data Generation

### Users

Creates 3 demo users with:
- Email addresses following the pattern `demo{N}@example.com`
- Default password: `DemoPassword123!`
- Realistic first and last names from predefined lists
- `isEmailVerified` and `isActive` set to `true`

### Projects

For each user, creates 3-5 projects with:
- Names from a predefined list of common project types
- Descriptions from a predefined list
- Colors randomly selected from a predefined palette

### Tags

Creates 8 tags with:
- Names from a predefined list of common productivity tags
- Colors randomly selected from a predefined palette

### Tasks

For each user, creates 15-25 tasks with:
- Titles from a predefined list of common task titles
- Descriptions from a predefined list
- Random priorities (0-4)
- Random statuses (pending, in-progress, completed, cancelled)
- Due dates within the next 30 days
- 80% chance of being assigned to a project
- 60% chance of being associated with 1-2 tags

### Time Blocks

For each user, creates 10-20 time blocks with:
- Titles from a predefined list of common time block titles
- Descriptions from a predefined list
- Start times within the next 7 days
- Durations between 30-120 minutes
- Colors randomly selected from a predefined palette
- 70% chance of being associated with a task

## Sample Data Sources

The system uses predefined arrays of sample data to generate realistic content:

1. **User Names**: 
   - First names: ["Alex", "Taylor", "Jordan", "Casey", "Riley", "Morgan", "Jamie", "Cameron"]
   - Last names: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]

2. **Project Names**:
   - ["Website Redesign", "Mobile App Development", "Marketing Campaign", "Product Launch", "System Migration"]

3. **Task Titles**:
   - ["Research competitors", "Create wireframes", "Write documentation", "Test functionality", "Review code"]

4. **Tag Names**:
   - ["Design", "Development", "Marketing", "Urgent", "Review", "Meeting", "Research", "Planning"]

5. **Color Palette**:
   - ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#d35400", "#34495e"]

## Error Handling

The system includes comprehensive error handling:
- Individual entity creation failures are logged but don't stop the process
- All errors are logged using NestJS Logger
- The system gracefully handles conflicts (e.g., time block conflicts)
- Security violations result in BadRequestException with descriptive messages

## Testing

The system includes unit tests that verify:
- Successful demo data creation
- Proper error handling for service failures
- Security checks for production environments
- Security checks for disabled demo data creation

Run tests with:
```bash
npm run test backend/demo-data
```