import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddSubtasksAndAttachments1756313601000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add parentId column to tasks table
    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'parentId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add position column to tasks table
    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'position',
        type: 'int',
        isNullable: true,
      }),
    );

    // Add foreign key constraint for parentId
    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['parentId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'CASCADE',
      }),
    );

    // Create TaskAttachments table
    await queryRunner.query(`
      CREATE TABLE "task_attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "fileName" character varying NOT NULL,
        "originalName" character varying NOT NULL,
        "mimeType" character varying NOT NULL,
        "fileSize" integer NOT NULL,
        "storagePath" character varying NOT NULL,
        "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "taskId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_task_attachments" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints for task_attachments
    await queryRunner.createForeignKey(
      'task_attachments',
      new TableForeignKey({
        columnNames: ['taskId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'task_attachments',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes for performance optimization
    await queryRunner.query('CREATE INDEX "IDX_TASK_PARENT" ON "tasks" ("parentId")');
    await queryRunner.query('CREATE INDEX "IDX_TASK_ATTACHMENT_TASK" ON "task_attachments" ("taskId")');
    await queryRunner.query('CREATE INDEX "IDX_TASK_ATTACHMENT_USER" ON "task_attachments" ("userId")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query('DROP INDEX "IDX_TASK_ATTACHMENT_USER"');
    await queryRunner.query('DROP INDEX "IDX_TASK_ATTACHMENT_TASK"');
    await queryRunner.query('DROP INDEX "IDX_TASK_PARENT"');

    // Drop foreign key constraints for task_attachments
    const taskAttachmentsTable = await queryRunner.getTable('task_attachments');
    if (taskAttachmentsTable) {
      const taskAttachmentsForeignKeys = taskAttachmentsTable.foreignKeys;
      for (const foreignKey of taskAttachmentsForeignKeys) {
        await queryRunner.dropForeignKey('task_attachments', foreignKey);
      }
    }

    // Drop foreign key constraint for parentId
    const tasksTable = await queryRunner.getTable('tasks');
    if (tasksTable) {
      const parentForeignKey = tasksTable.foreignKeys.find(fk => 
        fk.columnNames.includes('parentId')
      );
      if (parentForeignKey) {
        await queryRunner.dropForeignKey('tasks', parentForeignKey);
      }
    }

    // Drop task_attachments table
    await queryRunner.query('DROP TABLE "task_attachments"');

    // Drop columns from tasks table
    await queryRunner.dropColumn('tasks', 'position');
    await queryRunner.dropColumn('tasks', 'parentId');
  }
}