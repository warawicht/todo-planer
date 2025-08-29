import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class CreateAnalyticsTables1756439618745 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create report_templates table
        await queryRunner.createTable(new Table({
            name: "report_templates",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "userId",
                    type: "uuid",
                    isNullable: false
                },
                {
                    name: "name",
                    type: "varchar",
                    length: "255",
                    isNullable: false
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "configuration",
                    type: "jsonb",
                    isNullable: false
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

        // Create goals table
        await queryRunner.createTable(new Table({
            name: "goals",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "userId",
                    type: "uuid",
                    isNullable: false
                },
                {
                    name: "title",
                    type: "varchar",
                    length: "255",
                    isNullable: false
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "targetValue",
                    type: "decimal",
                    isNullable: false
                },
                {
                    name: "currentValue",
                    type: "decimal",
                    default: 0
                },
                {
                    name: "period",
                    type: "enum",
                    enum: ["daily", "weekly", "monthly"],
                    isNullable: false
                },
                {
                    name: "metric",
                    type: "enum",
                    enum: ["tasks_completed", "time_tracked", "projects_completed"],
                    isNullable: false
                },
                {
                    name: "startDate",
                    type: "timestamp",
                    isNullable: false
                },
                {
                    name: "endDate",
                    type: "timestamp",
                    isNullable: false
                },
                {
                    name: "completedAt",
                    type: "timestamp",
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

        // Create insights table
        await queryRunner.createTable(new Table({
            name: "insights",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "userId",
                    type: "uuid",
                    isNullable: false
                },
                {
                    name: "type",
                    type: "enum",
                    enum: ["improving_trend", "declining_trend", "pattern_identified", "recommendation"],
                    isNullable: false
                },
                {
                    name: "message",
                    type: "text",
                    isNullable: false
                },
                {
                    name: "severity",
                    type: "int",
                    default: 1
                },
                {
                    name: "isActionable",
                    type: "boolean",
                    default: false
                },
                {
                    name: "recommendation",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "isDismissed",
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

        // Create analytics_exports table
        await queryRunner.createTable(new Table({
            name: "analytics_exports",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "userId",
                    type: "uuid",
                    isNullable: false
                },
                {
                    name: "format",
                    type: "enum",
                    enum: ["pdf", "csv", "excel"],
                    isNullable: false
                },
                {
                    name: "dataType",
                    type: "enum",
                    enum: ["time_entries", "tasks", "summary"],
                    isNullable: false
                },
                {
                    name: "fileName",
                    type: "varchar",
                    length: "255",
                    isNullable: true
                },
                {
                    name: "startDate",
                    type: "timestamp",
                    isNullable: false
                },
                {
                    name: "endDate",
                    type: "timestamp",
                    isNullable: false
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pending", "processing", "completed", "failed", "cancelled"],
                    default: "'pending'"
                },
                {
                    name: "filters",
                    type: "jsonb",
                    isNullable: true
                },
                {
                    name: "completedAt",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "errorMessage",
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

        // Add foreign key constraints
        await queryRunner.createForeignKey("report_templates", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("goals", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("insights", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("analytics_exports", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        // Add indexes for performance optimization
        await queryRunner.query(`CREATE INDEX "IDX_REPORT_TEMPLATE_USER" ON "report_templates" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_GOAL_USER" ON "goals" ("userId", "period")`);
        await queryRunner.query(`CREATE INDEX "IDX_INSIGHT_USER" ON "insights" ("userId", "isDismissed")`);
        await queryRunner.query(`CREATE INDEX "IDX_ANALYTICS_EXPORT_USER" ON "analytics_exports" ("userId", "status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_ANALYTICS_EXPORT_USER"`);
        await queryRunner.query(`DROP INDEX "IDX_INSIGHT_USER"`);
        await queryRunner.query(`DROP INDEX "IDX_GOAL_USER"`);
        await queryRunner.query(`DROP INDEX "IDX_REPORT_TEMPLATE_USER"`);

        // Drop foreign key constraints
        const reportTemplatesTable = await queryRunner.getTable("report_templates");
        const goalsTable = await queryRunner.getTable("goals");
        const insightsTable = await queryRunner.getTable("insights");
        const analyticsExportsTable = await queryRunner.getTable("analytics_exports");

        if (reportTemplatesTable) {
            const reportTemplatesFk = reportTemplatesTable.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
            if (reportTemplatesFk) {
                await queryRunner.dropForeignKey("report_templates", reportTemplatesFk);
            }
        }

        if (goalsTable) {
            const goalsFk = goalsTable.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
            if (goalsFk) {
                await queryRunner.dropForeignKey("goals", goalsFk);
            }
        }

        if (insightsTable) {
            const insightsFk = insightsTable.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
            if (insightsFk) {
                await queryRunner.dropForeignKey("insights", insightsFk);
            }
        }

        if (analyticsExportsTable) {
            const analyticsExportsFk = analyticsExportsTable.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
            if (analyticsExportsFk) {
                await queryRunner.dropForeignKey("analytics_exports", analyticsExportsFk);
            }
        }

        // Drop tables
        await queryRunner.dropTable("analytics_exports", true);
        await queryRunner.dropTable("insights", true);
        await queryRunner.dropTable("goals", true);
        await queryRunner.dropTable("report_templates", true);
    }
}