import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddBillableRateToTimeEntry1756439647315 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add billableRate column to time_entries table
        await queryRunner.addColumn("time_entries", new TableColumn({
            name: "billableRate",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
            default: null
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove billableRate column from time_entries table
        await queryRunner.dropColumn("time_entries", "billableRate");
    }
}