import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCollaborationTables1756400000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create task_shares table
        await queryRunner.createTable(new Table({
            name: "task_shares",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "taskId",
                    type: "uuid"
                },
                {
                    name: "ownerId",
                    type: "uuid"
                },
                {
                    name: "sharedWithId",
                    type: "uuid"
                },
                {
                    name: "permissionLevel",
                    type: "enum",
                    enum: ["view", "edit", "manage"],
                    default: "'view'"
                },
                {
                    name: "isAccepted",
                    type: "boolean",
                    default: false
                },
                {
                    name: "acceptedAt",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "isRevoked",
                    type: "boolean",
                    default: false
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Create task_assignments table
        await queryRunner.createTable(new Table({
            name: "task_assignments",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "taskId",
                    type: "uuid"
                },
                {
                    name: "assignedById",
                    type: "uuid"
                },
                {
                    name: "assignedToId",
                    type: "uuid"
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pending", "accepted", "rejected", "completed"],
                    default: "'pending'"
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Create task_comments table
        await queryRunner.createTable(new Table({
            name: "task_comments",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "taskId",
                    type: "uuid"
                },
                {
                    name: "userId",
                    type: "uuid"
                },
                {
                    name: "content",
                    type: "text"
                },
                {
                    name: "parentId",
                    type: "uuid",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Create user_availability table
        await queryRunner.createTable(new Table({
            name: "user_availability",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "userId",
                    type: "uuid"
                },
                {
                    name: "startTime",
                    type: "timestamp"
                },
                {
                    name: "endTime",
                    type: "timestamp"
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["available", "busy", "away", "offline"],
                    default: "'available'"
                },
                {
                    name: "note",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Add foreign key constraints for task_shares
        await queryRunner.createForeignKey("task_shares", new TableForeignKey({
            columnNames: ["taskId"],
            referencedColumnNames: ["id"],
            referencedTableName: "tasks",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("task_shares", new TableForeignKey({
            columnNames: ["ownerId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("task_shares", new TableForeignKey({
            columnNames: ["sharedWithId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        // Add foreign key constraints for task_assignments
        await queryRunner.createForeignKey("task_assignments", new TableForeignKey({
            columnNames: ["taskId"],
            referencedColumnNames: ["id"],
            referencedTableName: "tasks",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("task_assignments", new TableForeignKey({
            columnNames: ["assignedById"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("task_assignments", new TableForeignKey({
            columnNames: ["assignedToId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        // Add foreign key constraints for task_comments
        await queryRunner.createForeignKey("task_comments", new TableForeignKey({
            columnNames: ["taskId"],
            referencedColumnNames: ["id"],
            referencedTableName: "tasks",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("task_comments", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("task_comments", new TableForeignKey({
            columnNames: ["parentId"],
            referencedColumnNames: ["id"],
            referencedTableName: "task_comments",
            onDelete: "CASCADE"
        }));

        // Add foreign key constraints for user_availability
        await queryRunner.createForeignKey("user_availability", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        const tableNames = ["task_shares", "task_assignments", "task_comments", "user_availability"];
        for (const tableName of tableNames) {
            const table = await queryRunner.getTable(tableName);
            if (table) {
                const foreignKeys = table.foreignKeys;
                for (const foreignKey of foreignKeys) {
                    await queryRunner.dropForeignKey(tableName, foreignKey);
                }
            }
        }

        // Drop tables
        await queryRunner.dropTable("user_availability");
        await queryRunner.dropTable("task_comments");
        await queryRunner.dropTable("task_assignments");
        await queryRunner.dropTable("task_shares");
    }
}