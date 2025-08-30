import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskManagementTables1724785200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Since the tables are already created in the previous migration, we only need to add indexes
    // Add indexes for performance optimization
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_TASK_USER_STATUS" ON "tasks" ("userId", "status")');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_TASK_USER_DUE_DATE" ON "tasks" ("userId", "dueDate")');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_TASK_PROJECT" ON "tasks" ("projectId")');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_PROJECT_USER_ARCHIVED" ON "projects" ("userId", "isArchived")');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_TAG_USER_NAME" ON "tags" ("userId", "name")');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_TIME_BLOCK_USER_TIME" ON "time_blocks" ("userId", "startTime", "endTime")');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_TIME_BLOCK_TASK" ON "time_blocks" ("taskId")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_TIME_BLOCK_TASK"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_TIME_BLOCK_USER_TIME"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_TAG_USER_NAME"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_PROJECT_USER_ARCHIVED"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_TASK_PROJECT"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_TASK_USER_DUE_DATE"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_TASK_USER_STATUS"');
  }
}