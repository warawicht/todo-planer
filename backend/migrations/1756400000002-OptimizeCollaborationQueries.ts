import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class OptimizeCollaborationQueries1756400000002 implements MigrationInterface {
    name = 'OptimizeCollaborationQueries1756400000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes for task_shares table to optimize common query patterns
        await queryRunner.createIndex("task_shares", new TableIndex({
            name: "IDX_TASK_SHARES_OWNER_SHARED_WITH",
            columnNames: ["ownerId", "sharedWithId"]
        }));

        await queryRunner.createIndex("task_shares", new TableIndex({
            name: "IDX_TASK_SHARES_TASK_OWNER",
            columnNames: ["taskId", "ownerId"]
        }));

        // Add indexes for task_assignments table to optimize common query patterns
        await queryRunner.createIndex("task_assignments", new TableIndex({
            name: "IDX_TASK_ASSIGNMENTS_TASK_ASSIGNED_BY",
            columnNames: ["taskId", "assignedById"]
        }));

        await queryRunner.createIndex("task_assignments", new TableIndex({
            name: "IDX_TASK_ASSIGNMENTS_ASSIGNED_BY_ASSIGNED_TO",
            columnNames: ["assignedById", "assignedToId"]
        }));

        // Add indexes for task_comments table to optimize common query patterns
        await queryRunner.createIndex("task_comments", new TableIndex({
            name: "IDX_TASK_COMMENTS_USER_TASK",
            columnNames: ["userId", "taskId"]
        }));

        // Add indexes for tasks table to optimize collaboration-related queries
        await queryRunner.createIndex("tasks", new TableIndex({
            name: "IDX_TASKS_USER_STATUS_PRIORITY",
            columnNames: ["userId", "status", "priority"]
        }));

        await queryRunner.createIndex("tasks", new TableIndex({
            name: "IDX_TASKS_PROJECT_STATUS",
            columnNames: ["projectId", "status"]
        }));

        // Add indexes for users table to optimize collaboration-related queries
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_USERS_EMAIL" ON "users" ("email");
        `);

        // Add composite indexes for complex collaboration queries
        await queryRunner.createIndex("task_shares", new TableIndex({
            name: "IDX_TASK_SHARES_TASK_OWNER_SHARED_WITH",
            columnNames: ["taskId", "ownerId", "sharedWithId"]
        }));

        await queryRunner.createIndex("task_assignments", new TableIndex({
            name: "IDX_TASK_ASSIGNMENTS_TASK_ASSIGNED_TO_STATUS",
            columnNames: ["taskId", "assignedToId", "status"]
        }));

        await queryRunner.createIndex("task_comments", new TableIndex({
            name: "IDX_TASK_COMMENTS_TASK_USER_CREATED",
            columnNames: ["taskId", "userId", "createdAt"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes for task_shares table
        await queryRunner.dropIndex("task_shares", "IDX_TASK_SHARES_OWNER_SHARED_WITH");
        await queryRunner.dropIndex("task_shares", "IDX_TASK_SHARES_TASK_OWNER");
        await queryRunner.dropIndex("task_shares", "IDX_TASK_SHARES_TASK_OWNER_SHARED_WITH");

        // Drop indexes for task_assignments table
        await queryRunner.dropIndex("task_assignments", "IDX_TASK_ASSIGNMENTS_TASK_ASSIGNED_BY");
        await queryRunner.dropIndex("task_assignments", "IDX_TASK_ASSIGNMENTS_ASSIGNED_BY_ASSIGNED_TO");
        await queryRunner.dropIndex("task_assignments", "IDX_TASK_ASSIGNMENTS_TASK_ASSIGNED_TO_STATUS");

        // Drop indexes for task_comments table
        await queryRunner.dropIndex("task_comments", "IDX_TASK_COMMENTS_USER_TASK");
        await queryRunner.dropIndex("task_comments", "IDX_TASK_COMMENTS_TASK_USER_CREATED");

        // Drop indexes for tasks table
        await queryRunner.dropIndex("tasks", "IDX_TASKS_USER_STATUS_PRIORITY");
        await queryRunner.dropIndex("tasks", "IDX_TASKS_PROJECT_STATUS");

        // Drop indexes for users table
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_USERS_EMAIL";
        `);
    }
}