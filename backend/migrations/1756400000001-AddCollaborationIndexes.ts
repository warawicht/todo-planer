import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddCollaborationIndexes1756400000001 implements MigrationInterface {
    name = 'AddCollaborationIndexes1756400000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes for task_shares table
        await queryRunner.createIndex("task_shares", new TableIndex({
            name: "IDX_TASK_SHARES_TASK_ID",
            columnNames: ["taskId"]
        }));

        await queryRunner.createIndex("task_shares", new TableIndex({
            name: "IDX_TASK_SHARES_OWNER_ID",
            columnNames: ["ownerId"]
        }));

        await queryRunner.createIndex("task_shares", new TableIndex({
            name: "IDX_TASK_SHARES_SHARED_WITH_ID",
            columnNames: ["sharedWithId"]
        }));

        await queryRunner.createIndex("task_shares", new TableIndex({
            name: "IDX_TASK_SHARES_PERMISSION_LEVEL",
            columnNames: ["permissionLevel"]
        }));

        await queryRunner.createIndex("task_shares", new TableIndex({
            name: "IDX_TASK_SHARES_IS_ACCEPTED",
            columnNames: ["isAccepted"]
        }));

        await queryRunner.createIndex("task_shares", new TableIndex({
            name: "IDX_TASK_SHARES_IS_REVOKED",
            columnNames: ["isRevoked"]
        }));

        // Add indexes for task_assignments table
        await queryRunner.createIndex("task_assignments", new TableIndex({
            name: "IDX_TASK_ASSIGNMENTS_TASK_ID",
            columnNames: ["taskId"]
        }));

        await queryRunner.createIndex("task_assignments", new TableIndex({
            name: "IDX_TASK_ASSIGNMENTS_ASSIGNED_BY_ID",
            columnNames: ["assignedById"]
        }));

        await queryRunner.createIndex("task_assignments", new TableIndex({
            name: "IDX_TASK_ASSIGNMENTS_ASSIGNED_TO_ID",
            columnNames: ["assignedToId"]
        }));

        await queryRunner.createIndex("task_assignments", new TableIndex({
            name: "IDX_TASK_ASSIGNMENTS_STATUS",
            columnNames: ["status"]
        }));

        // Add indexes for task_comments table
        await queryRunner.createIndex("task_comments", new TableIndex({
            name: "IDX_TASK_COMMENTS_TASK_ID",
            columnNames: ["taskId"]
        }));

        await queryRunner.createIndex("task_comments", new TableIndex({
            name: "IDX_TASK_COMMENTS_USER_ID",
            columnNames: ["userId"]
        }));

        await queryRunner.createIndex("task_comments", new TableIndex({
            name: "IDX_TASK_COMMENTS_PARENT_ID",
            columnNames: ["parentId"]
        }));

        await queryRunner.createIndex("task_comments", new TableIndex({
            name: "IDX_TASK_COMMENTS_CREATED_AT",
            columnNames: ["createdAt"]
        }));

        // Add indexes for user_availability table
        await queryRunner.createIndex("user_availability", new TableIndex({
            name: "IDX_USER_AVAILABILITIES_USER_ID",
            columnNames: ["userId"]
        }));

        await queryRunner.createIndex("user_availability", new TableIndex({
            name: "IDX_USER_AVAILABILITIES_START_TIME",
            columnNames: ["startTime"]
        }));

        await queryRunner.createIndex("user_availability", new TableIndex({
            name: "IDX_USER_AVAILABILITIES_END_TIME",
            columnNames: ["endTime"]
        }));

        await queryRunner.createIndex("user_availability", new TableIndex({
            name: "IDX_USER_AVAILABILITIES_STATUS",
            columnNames: ["status"]
        }));

        // Add composite indexes for common query patterns
        await queryRunner.createIndex("task_shares", new TableIndex({
            name: "IDX_TASK_SHARES_SHARED_WITH_STATUS",
            columnNames: ["sharedWithId", "isAccepted", "isRevoked"]
        }));

        await queryRunner.createIndex("task_assignments", new TableIndex({
            name: "IDX_TASK_ASSIGNMENTS_ASSIGNED_TO_STATUS",
            columnNames: ["assignedToId", "status"]
        }));

        await queryRunner.createIndex("task_comments", new TableIndex({
            name: "IDX_TASK_COMMENTS_TASK_CREATED",
            columnNames: ["taskId", "createdAt"]
        }));

        await queryRunner.createIndex("user_availability", new TableIndex({
            name: "IDX_USER_AVAILABILITIES_USER_TIME",
            columnNames: ["userId", "startTime", "endTime"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes for task_shares table
        await queryRunner.dropIndex("task_shares", "IDX_TASK_SHARES_TASK_ID");
        await queryRunner.dropIndex("task_shares", "IDX_TASK_SHARES_OWNER_ID");
        await queryRunner.dropIndex("task_shares", "IDX_TASK_SHARES_SHARED_WITH_ID");
        await queryRunner.dropIndex("task_shares", "IDX_TASK_SHARES_PERMISSION_LEVEL");
        await queryRunner.dropIndex("task_shares", "IDX_TASK_SHARES_IS_ACCEPTED");
        await queryRunner.dropIndex("task_shares", "IDX_TASK_SHARES_IS_REVOKED");

        // Drop indexes for task_assignments table
        await queryRunner.dropIndex("task_assignments", "IDX_TASK_ASSIGNMENTS_TASK_ID");
        await queryRunner.dropIndex("task_assignments", "IDX_TASK_ASSIGNMENTS_ASSIGNED_BY_ID");
        await queryRunner.dropIndex("task_assignments", "IDX_TASK_ASSIGNMENTS_ASSIGNED_TO_ID");
        await queryRunner.dropIndex("task_assignments", "IDX_TASK_ASSIGNMENTS_STATUS");

        // Drop indexes for task_comments table
        await queryRunner.dropIndex("task_comments", "IDX_TASK_COMMENTS_TASK_ID");
        await queryRunner.dropIndex("task_comments", "IDX_TASK_COMMENTS_USER_ID");
        await queryRunner.dropIndex("task_comments", "IDX_TASK_COMMENTS_PARENT_ID");
        await queryRunner.dropIndex("task_comments", "IDX_TASK_COMMENTS_CREATED_AT");

        // Drop indexes for user_availability table
        await queryRunner.dropIndex("user_availability", "IDX_USER_AVAILABILITIES_USER_ID");
        await queryRunner.dropIndex("user_availability", "IDX_USER_AVAILABILITIES_START_TIME");
        await queryRunner.dropIndex("user_availability", "IDX_USER_AVAILABILITIES_END_TIME");
        await queryRunner.dropIndex("user_availability", "IDX_USER_AVAILABILITIES_STATUS");

        // Drop composite indexes
        await queryRunner.dropIndex("task_shares", "IDX_TASK_SHARES_SHARED_WITH_STATUS");
        await queryRunner.dropIndex("task_assignments", "IDX_TASK_ASSIGNMENTS_ASSIGNED_TO_STATUS");
        await queryRunner.dropIndex("task_comments", "IDX_TASK_COMMENTS_TASK_CREATED");
        await queryRunner.dropIndex("user_availability", "IDX_USER_AVAILABILITIES_USER_TIME");
    }
}