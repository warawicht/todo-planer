# Moving Backend Code to Dedicated Backend Folder

## Overview

This document outlines the plan to reorganize the todo-planer project structure by moving all backend-related code from the `src` directory to a new dedicated `backend` directory. This change will improve the project's architecture by clearly separating frontend and backend code, making the codebase more maintainable and easier to understand.

## Current Architecture

The current project structure mixes frontend and backend code in the root directory:

```
.
├── frontend/              # Frontend code
├── src/                   # Backend code (mixed with some frontend configurations)
│   ├── ai-scheduling/
│   ├── auth/
│   ├── collaboration/
│   ├── database/
│   ├── enterprise/
│   ├── health/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── migrations/
│   ├── notifications/
│   ├── offline/
│   ├── productivity-tracking/
│   ├── projects/
│   ├── settings/
│   ├── tags/
│   ├── tasks/
│   ├── time-blocks/
│   └── users/
├── test/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Proposed Architecture

After the reorganization, the project structure will clearly separate frontend and backend code:

```
.
├── frontend/              # Frontend code
├── backend/               # Backend code (moved from src/)
│   ├── ai-scheduling/
│   ├── auth/
│   ├── collaboration/
│   ├── database/
│   ├── enterprise/
│   ├── health/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── migrations/
│   ├── notifications/
│   ├── offline/
│   ├── productivity-tracking/
│   ├── projects/
│   ├── settings/
│   ├── tags/
│   ├── tasks/
│   ├── time-blocks/
│   └── users/
├── test/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Changes Required

### 1. Directory Structure Changes

- Move all contents from `src/` directory to a new `backend/` directory
- Update configuration files to reflect the new directory structure

### 2. Configuration Updates

#### nest-cli.json
Update the `sourceRoot` property from `"src"` to `"backend"`:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "backend",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

#### package.json
Update all scripts that reference the `src` directory to use `backend` instead:

```json
{
  "scripts": {
    "build": "nest build --path backend",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm migration:generate -- -d backend/database/data-source.ts",
    "migration:run": "npm run typeorm migration:run -- -d backend/database/data-source.ts",
    "migration:revert": "npm run typeorm migration:revert -- -d backend/database/data-source.ts"
  }
}
```

#### tsconfig.json
Update the `include` and `exclude` sections to reflect the new directory structure:

```json
{
  "include": ["backend/**/*", "test/**/*"],
  "exclude": ["node_modules", "frontend", "dist"]
}
```

#### backend/main.ts
Update import paths to reflect the new directory structure (no changes needed as imports are relative).

#### backend/app.module.ts
Update import paths to reflect the new directory structure (no changes needed as imports are relative).

### 3. Database Migration Path Updates

The database migrations reference entity files with absolute paths. These paths need to be updated to reflect the new directory structure.

### 4. Test Configuration Updates

Update test configurations to point to the new backend directory structure.

## Implementation Steps

### Step 1: Create Backend Directory
```bash
mkdir backend
```

### Step 2: Move Backend Files
Move all contents from `src/` to `backend/`:
```bash
mv src/* backend/
```

### Step 3: Update Configuration Files
Update the following files with the new directory structure:
1. `nest-cli.json` - Update `sourceRoot` to `"backend"`
2. `package.json` - Update all scripts referencing `src` to use `backend`
3. `tsconfig.json` - Update `include` paths to use `backend`

### Step 4: Update Import Paths
Verify that all import paths in the backend code are still correct after the move.

### Step 5: Test the Application
1. Run unit tests
2. Run end-to-end tests
3. Start the application in development mode
4. Verify all functionality works correctly

## Risk Assessment

### Low Risk
- Moving files is a straightforward operation
- Relative import paths should remain unchanged
- Configuration updates are well-defined

### Medium Risk
- Database migration files may need path updates
- Some absolute paths in configuration files may break
- Test configurations may need updates

### Mitigation Strategies
- Create a backup of the project before making changes
- Test each configuration update incrementally
- Run all tests after each major change

## Testing Plan

1. **Before Migration**: Run all tests to establish a baseline
2. **After File Move**: Verify all relative imports still work
3. **After Configuration Updates**: Run unit tests
4. **After Path Updates**: Run end-to-end tests
5. **Final Verification**: Start application and verify all features work

## Rollback Plan

If issues arise during the migration:

1. Restore the project from backup
2. Revert configuration file changes
3. Reinstall dependencies if needed
4. Run tests to verify functionality is restored

## Timeline

| Task | Estimated Time |
|------|----------------|
| Preparation and backup | 30 minutes |
| File migration | 1 hour |
| Configuration updates | 2 hours |
| Testing and verification | 2 hours |
| **Total** | **5.5 hours** |

## Success Criteria

- All backend code is moved to the `backend/` directory
- All configuration files are updated correctly
- Application builds without errors
- All unit tests pass
- All end-to-end tests pass
- Application functions correctly in development mode