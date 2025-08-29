import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTaskManagementTables1724785200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Tasks table
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'dueDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'priority',
            type: 'int',
            default: 0,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'pending'",
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'projectId',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create Projects table
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isArchived',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    // Create Tags table
    await queryRunner.createTable(
      new Table({
        name: 'tags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    // Create TimeBlocks table
    await queryRunner.createTable(
      new Table({
        name: 'time_blocks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'startTime',
            type: 'timestamp',
          },
          {
            name: 'endTime',
            type: 'timestamp',
          },
          {
            name: 'recurrencePattern',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'taskId',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create Task-Tags junction table
    await queryRunner.createTable(
      new Table({
        name: 'task_tags',
        columns: [
          {
            name: 'taskId',
            type: 'uuid',
          },
          {
            name: 'tagId',
            type: 'uuid',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['taskId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tasks',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['tagId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'tags',
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['projectId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'projects',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'tags',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'time_blocks',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'time_blocks',
      new TableForeignKey({
        columnNames: ['taskId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'SET NULL',
      }),
    );

    // Add indexes for performance optimization
    await queryRunner.query('CREATE INDEX "IDX_TASK_USER_STATUS" ON "tasks" ("userId", "status")');
    await queryRunner.query('CREATE INDEX "IDX_TASK_USER_DUE_DATE" ON "tasks" ("userId", "dueDate")');
    await queryRunner.query('CREATE INDEX "IDX_TASK_PROJECT" ON "tasks" ("projectId")');
    await queryRunner.query('CREATE INDEX "IDX_PROJECT_USER_ARCHIVED" ON "projects" ("userId", "isArchived")');
    await queryRunner.query('CREATE INDEX "IDX_TAG_USER_NAME" ON "tags" ("userId", "name")');
    await queryRunner.query('CREATE INDEX "IDX_TIME_BLOCK_USER_TIME" ON "time_blocks" ("userId", "startTime", "endTime")');
    await queryRunner.query('CREATE INDEX "IDX_TIME_BLOCK_TASK" ON "time_blocks" ("taskId")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query('DROP INDEX "IDX_TIME_BLOCK_TASK"');
    await queryRunner.query('DROP INDEX "IDX_TIME_BLOCK_USER_TIME"');
    await queryRunner.query('DROP INDEX "IDX_TAG_USER_NAME"');
    await queryRunner.query('DROP INDEX "IDX_PROJECT_USER_ARCHIVED"');
    await queryRunner.query('DROP INDEX "IDX_TASK_PROJECT"');
    await queryRunner.query('DROP INDEX "IDX_TASK_USER_DUE_DATE"');
    await queryRunner.query('DROP INDEX "IDX_TASK_USER_STATUS"');

    // Drop foreign key constraints
    const tableNames = ['tasks', 'projects', 'tags', 'time_blocks'];
    for (const tableName of tableNames) {
      const table = await queryRunner.getTable(tableName);
      if (table) {
        const foreignKeys = table.foreignKeys;
        for (const foreignKey of foreignKeys) {
          await queryRunner.dropForeignKey(tableName, foreignKey);
        }
      }
    }

    // Drop junction table
    await queryRunner.dropTable('task_tags');

    // Drop tables
    await queryRunner.dropTable('time_blocks');
    await queryRunner.dropTable('tags');
    await queryRunner.dropTable('projects');
    await queryRunner.dropTable('tasks');
  }
}