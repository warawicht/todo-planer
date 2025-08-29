import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateEnterpriseFeatureTables1756600000000 implements MigrationInterface {
    name = 'CreateEnterpriseFeatureTables1756600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create roles table
        await queryRunner.createTable(new Table({
            name: "roles",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "name",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "isActive",
                    type: "boolean",
                    default: true
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

        // Create permissions table
        await queryRunner.createTable(new Table({
            name: "permissions",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "name",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "description",
                    type: "text"
                },
                {
                    name: "resource",
                    type: "varchar"
                },
                {
                    name: "action",
                    type: "varchar"
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

        // Create user_roles table
        await queryRunner.createTable(new Table({
            name: "user_roles",
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
                    name: "roleId",
                    type: "uuid"
                },
                {
                    name: "isActive",
                    type: "boolean",
                    default: true
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

        // Create role_permissions table
        await queryRunner.createTable(new Table({
            name: "role_permissions",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "roleId",
                    type: "uuid"
                },
                {
                    name: "permissionId",
                    type: "uuid"
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

        // Create activity_logs table
        await queryRunner.createTable(new Table({
            name: "activity_logs",
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
                    name: "action",
                    type: "varchar"
                },
                {
                    name: "metadata",
                    type: "jsonb"
                },
                {
                    name: "ipAddress",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "userAgent",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "timestamp",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Create workflows table
        await queryRunner.createTable(new Table({
            name: "workflows",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "name",
                    type: "varchar"
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "steps",
                    type: "jsonb"
                },
                {
                    name: "isActive",
                    type: "boolean",
                    default: true
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

        // Create workflow_instances table
        await queryRunner.createTable(new Table({
            name: "workflow_instances",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "workflowId",
                    type: "uuid"
                },
                {
                    name: "resourceId",
                    type: "uuid"
                },
                {
                    name: "resourceType",
                    type: "varchar"
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pending", "approved", "rejected", "completed"],
                    default: "'pending'"
                },
                {
                    name: "currentStep",
                    type: "jsonb"
                },
                {
                    name: "approvalHistory",
                    type: "jsonb"
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

        // Create audit_trails table
        await queryRunner.createTable(new Table({
            name: "audit_trails",
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
                    name: "action",
                    type: "varchar"
                },
                {
                    name: "resourceType",
                    type: "varchar"
                },
                {
                    name: "resourceId",
                    type: "uuid"
                },
                {
                    name: "beforeState",
                    type: "jsonb",
                    isNullable: true
                },
                {
                    name: "afterState",
                    type: "jsonb",
                    isNullable: true
                },
                {
                    name: "ipAddress",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "timestamp",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Add foreign key constraints for user_roles
        await queryRunner.createForeignKey("user_roles", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("user_roles", new TableForeignKey({
            columnNames: ["roleId"],
            referencedColumnNames: ["id"],
            referencedTableName: "roles",
            onDelete: "CASCADE"
        }));

        // Add foreign key constraints for role_permissions
        await queryRunner.createForeignKey("role_permissions", new TableForeignKey({
            columnNames: ["roleId"],
            referencedColumnNames: ["id"],
            referencedTableName: "roles",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("role_permissions", new TableForeignKey({
            columnNames: ["permissionId"],
            referencedColumnNames: ["id"],
            referencedTableName: "permissions",
            onDelete: "CASCADE"
        }));

        // Add foreign key constraints for activity_logs
        await queryRunner.createForeignKey("activity_logs", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        // Add foreign key constraints for workflow_instances
        await queryRunner.createForeignKey("workflow_instances", new TableForeignKey({
            columnNames: ["workflowId"],
            referencedColumnNames: ["id"],
            referencedTableName: "workflows",
            onDelete: "CASCADE"
        }));

        // Add foreign key constraints for audit_trails
        await queryRunner.createForeignKey("audit_trails", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        // Add indexes for optimized queries
        await queryRunner.createIndex("roles", new TableIndex({
            name: "IDX_ROLES_NAME",
            columnNames: ["name"]
        }));

        await queryRunner.createIndex("permissions", new TableIndex({
            name: "IDX_PERMISSIONS_NAME",
            columnNames: ["name"]
        }));

        await queryRunner.createIndex("permissions", new TableIndex({
            name: "IDX_PERMISSIONS_RESOURCE_ACTION",
            columnNames: ["resource", "action"]
        }));

        await queryRunner.createIndex("user_roles", new TableIndex({
            name: "IDX_USER_ROLES_USER_ID",
            columnNames: ["userId"]
        }));

        await queryRunner.createIndex("user_roles", new TableIndex({
            name: "IDX_USER_ROLES_ROLE_ID",
            columnNames: ["roleId"]
        }));

        await queryRunner.createIndex("user_roles", new TableIndex({
            name: "IDX_USER_ROLES_USER_ROLE",
            columnNames: ["userId", "roleId"]
        }));

        await queryRunner.createIndex("role_permissions", new TableIndex({
            name: "IDX_ROLE_PERMISSIONS_ROLE_ID",
            columnNames: ["roleId"]
        }));

        await queryRunner.createIndex("role_permissions", new TableIndex({
            name: "IDX_ROLE_PERMISSIONS_PERMISSION_ID",
            columnNames: ["permissionId"]
        }));

        await queryRunner.createIndex("role_permissions", new TableIndex({
            name: "IDX_ROLE_PERMISSIONS_ROLE_PERMISSION",
            columnNames: ["roleId", "permissionId"]
        }));

        await queryRunner.createIndex("activity_logs", new TableIndex({
            name: "IDX_ACTIVITY_LOGS_USER_ID",
            columnNames: ["userId"]
        }));

        await queryRunner.createIndex("activity_logs", new TableIndex({
            name: "IDX_ACTIVITY_LOGS_ACTION",
            columnNames: ["action"]
        }));

        await queryRunner.createIndex("activity_logs", new TableIndex({
            name: "IDX_ACTIVITY_LOGS_TIMESTAMP",
            columnNames: ["timestamp"]
        }));

        await queryRunner.createIndex("workflow_instances", new TableIndex({
            name: "IDX_WORKFLOW_INSTANCES_WORKFLOW_ID",
            columnNames: ["workflowId"]
        }));

        await queryRunner.createIndex("workflow_instances", new TableIndex({
            name: "IDX_WORKFLOW_INSTANCES_STATUS",
            columnNames: ["status"]
        }));

        await queryRunner.createIndex("audit_trails", new TableIndex({
            name: "IDX_AUDIT_TRAILS_USER_ID",
            columnNames: ["userId"]
        }));

        await queryRunner.createIndex("audit_trails", new TableIndex({
            name: "IDX_AUDIT_TRAILS_RESOURCE_TYPE",
            columnNames: ["resourceType"]
        }));

        await queryRunner.createIndex("audit_trails", new TableIndex({
            name: "IDX_AUDIT_TRAILS_RESOURCE_ID",
            columnNames: ["resourceId"]
        }));

        await queryRunner.createIndex("audit_trails", new TableIndex({
            name: "IDX_AUDIT_TRAILS_TIMESTAMP",
            columnNames: ["timestamp"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        const tableNames = ["user_roles", "role_permissions", "activity_logs", "workflow_instances", "audit_trails"];
        for (const tableName of tableNames) {
            const table = await queryRunner.getTable(tableName);
            if (table) {
                const foreignKeys = table.foreignKeys;
                for (const foreignKey of foreignKeys) {
                    await queryRunner.dropForeignKey(tableName, foreignKey);
                }
            }
        }

        // Drop indexes
        const indexTables = [
            "roles", "permissions", "user_roles", "role_permissions", 
            "activity_logs", "workflow_instances", "audit_trails"
        ];
        
        for (const tableName of indexTables) {
            const table = await queryRunner.getTable(tableName);
            if (table) {
                const indexes = table.indices;
                for (const index of indexes) {
                    await queryRunner.dropIndex(tableName, index);
                }
            }
        }

        // Drop tables in reverse order
        await queryRunner.dropTable("audit_trails");
        await queryRunner.dropTable("workflow_instances");
        await queryRunner.dropTable("workflows");
        await queryRunner.dropTable("activity_logs");
        await queryRunner.dropTable("role_permissions");
        await queryRunner.dropTable("user_roles");
        await queryRunner.dropTable("permissions");
        await queryRunner.dropTable("roles");
    }
}