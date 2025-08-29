import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddVersionTrackingFields1756500000000 implements MigrationInterface {
    name = 'AddVersionTrackingFields1756500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add version and lastSynced columns to tasks table
        await queryRunner.addColumns('tasks', [
            new TableColumn({
                name: 'version',
                type: 'integer',
                default: 1,
                isNullable: false
            }),
            new TableColumn({
                name: 'lastSynced',
                type: 'timestamp',
                isNullable: true
            })
        ]);

        // Add version and lastSynced columns to time_blocks table
        await queryRunner.addColumns('time_blocks', [
            new TableColumn({
                name: 'version',
                type: 'integer',
                default: 1,
                isNullable: false
            }),
            new TableColumn({
                name: 'lastSynced',
                type: 'timestamp',
                isNullable: true
            })
        ]);

        // Add version and lastSynced columns to projects table
        await queryRunner.addColumns('projects', [
            new TableColumn({
                name: 'version',
                type: 'integer',
                default: 1,
                isNullable: false
            }),
            new TableColumn({
                name: 'lastSynced',
                type: 'timestamp',
                isNullable: true
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove version and lastSynced columns from tasks table
        await queryRunner.dropColumns('tasks', ['version', 'lastSynced']);

        // Remove version and lastSynced columns from time_blocks table
        await queryRunner.dropColumns('time_blocks', ['version', 'lastSynced']);

        // Remove version and lastSynced columns from projects table
        await queryRunner.dropColumns('projects', ['version', 'lastSynced']);
    }
}