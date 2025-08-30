import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSettingsTables1756361929261 implements MigrationInterface {
    name = 'CreateSettingsTables1756361929261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Skip creating task_attachments table since it's already created in AddSubtasksAndAttachments migration
        await queryRunner.query(`CREATE TYPE "public"."reminders_timebefore_enum" AS ENUM('at_time', '5_min', '1_hour', '1_day')`);
        await queryRunner.query(`CREATE TABLE "reminders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "taskId" uuid NOT NULL, "timeBefore" "public"."reminders_timebefore_enum" NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "lastSentAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "time_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "taskId" uuid, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP, "duration" bigint, "isManual" boolean NOT NULL DEFAULT false, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b8bc5f10269ba2fe88708904aa0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."calendar_view_preferences_defaultview_enum" AS ENUM('day', 'week', 'month')`);
        await queryRunner.query(`CREATE TYPE "public"."calendar_view_preferences_timeformat_enum" AS ENUM('12h', '24h')`);
        await queryRunner.query(`CREATE TABLE "calendar_view_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "defaultView" "public"."calendar_view_preferences_defaultview_enum" NOT NULL DEFAULT 'week', "firstDayOfWeek" integer NOT NULL DEFAULT '0', "showWeekends" boolean NOT NULL DEFAULT true, "timeFormat" "public"."calendar_view_preferences_timeformat_enum" NOT NULL DEFAULT '12h', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_2dc2d738a274989548c726becf" UNIQUE ("userId"), CONSTRAINT "PK_13e286140dc2a3a411405385b63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('task_reminder', 'time_block_alert', 'deadline_warning', 'productivity_summary', 'system_alert')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_channel_enum" AS ENUM('email', 'push', 'in_app')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_relatedentitytype_enum" AS ENUM('task', 'time_block', 'project')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "title" character varying NOT NULL, "message" text NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "channel" "public"."notifications_channel_enum" NOT NULL, "priority" integer NOT NULL DEFAULT '2', "read" boolean NOT NULL DEFAULT false, "dismissed" boolean NOT NULL DEFAULT false, "sentAt" TIMESTAMP, "readAt" TIMESTAMP, "relatedEntityId" uuid, "relatedEntityType" "public"."notifications_relatedentitytype_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "productivity_statistics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "date" date NOT NULL, "tasksCompleted" integer NOT NULL, "tasksCreated" integer NOT NULL, "overdueTasks" integer NOT NULL, "completionRate" double precision NOT NULL, "totalTimeTracked" bigint NOT NULL, "averageCompletionTime" double precision, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_22743d94657e80f01821117eecb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trend_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "period" character varying NOT NULL, "data" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e09a8e0a4c2898395a631d906cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dashboard_widgets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "widgetType" character varying NOT NULL, "position" integer NOT NULL, "config" jsonb NOT NULL, "isVisible" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a77038e4644617970badd975284" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "emailEnabled" boolean NOT NULL DEFAULT true, "pushEnabled" boolean NOT NULL DEFAULT true, "inAppEnabled" boolean NOT NULL DEFAULT true, "quietHoursStart" TIME, "quietHoursEnd" TIME, "quietHoursEnabled" boolean NOT NULL DEFAULT false, "taskRemindersEnabled" boolean NOT NULL DEFAULT true, "timeBlockAlertsEnabled" boolean NOT NULL DEFAULT true, "deadlineWarningsEnabled" boolean NOT NULL DEFAULT true, "productivitySummariesEnabled" boolean NOT NULL DEFAULT true, "systemAlertsEnabled" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_b70c44e8b00757584a39322559" UNIQUE ("userId"), CONSTRAINT "PK_e94e2b543f2f218ee68e4f4fad2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."theme_preferences_theme_enum" AS ENUM('light', 'dark', 'system')`);
        await queryRunner.query(`CREATE TABLE "theme_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "theme" "public"."theme_preferences_theme_enum" NOT NULL DEFAULT 'system', "accentColor" character varying NOT NULL DEFAULT '#4a76d4', "highContrastMode" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_675fb847ac56640995ab5dbba5" UNIQUE ("userId"), CONSTRAINT "PK_1f9a3140902281e3a98f3da7ea5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "timezone_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "timezone" character varying NOT NULL DEFAULT 'UTC', "autoDetect" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_b3a3b6b324743cc281721fdcfe" UNIQUE ("userId"), CONSTRAINT "PK_9b23b5ac545593c9ce3885822b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profile_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "firstName" character varying, "lastName" character varying, "avatarUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_6c47582d79921eb26a1bb5da3d" UNIQUE ("userId"), CONSTRAINT "PK_bfa20494097c34bdec768865099" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."data_exports_format_enum" AS ENUM('json', 'csv', 'pdf')`);
        await queryRunner.query(`CREATE TYPE "public"."data_exports_datatype_enum" AS ENUM('all', 'tasks', 'projects', 'time-blocks')`);
        await queryRunner.query(`CREATE TYPE "public"."data_exports_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "data_exports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "format" "public"."data_exports_format_enum" NOT NULL DEFAULT 'json', "dataType" "public"."data_exports_datatype_enum" NOT NULL DEFAULT 'all', "fileName" character varying, "exportedAt" TIMESTAMP, "status" "public"."data_exports_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3e8b8b297ef4446f30527695c10" PRIMARY KEY ("id"))`);
        
        // Check if parentId column exists before adding it
        const parentIdColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'parentId'
        `);
        
        if (parentIdColumnExists.length === 0) {
            await queryRunner.query(`ALTER TABLE "tasks" ADD "parentId" uuid`);
        }
        
        // Check if position column exists before adding it
        const positionColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'position'
        `);
        
        if (positionColumnExists.length === 0) {
            await queryRunner.query(`ALTER TABLE "tasks" ADD "position" integer`);
        }
        
        // Skip creating foreign key constraints for task_attachments since they're already created
        await queryRunner.query(`ALTER TABLE "reminders" ADD CONSTRAINT "FK_f8e4bc520d9e692652afaf3308b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reminders" ADD CONSTRAINT "FK_fd166880b624ea8560667d43101" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "time_entries" ADD CONSTRAINT "FK_d1b452d7f0d45863303b7d30000" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "time_entries" ADD CONSTRAINT "FK_8cfb57662e88d7c65010311661d" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        
        // Check if parentId foreign key exists before adding it
        const parentIdFkExists = await queryRunner.query(`
            SELECT tc.constraint_name 
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'tasks' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'parentId'
        `);
        
        if (parentIdFkExists.length === 0) {
            await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_1cbec65196d4cf86dd8ab464085" FOREIGN KEY ("parentId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        }
        
        await queryRunner.query(`ALTER TABLE "calendar_view_preferences" ADD CONSTRAINT "FK_2dc2d738a274989548c726becff" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productivity_statistics" ADD CONSTRAINT "FK_db62fcfcc3f2d120e50e7b950d4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trend_data" ADD CONSTRAINT "FK_fea93c0be57b6e39a719563e259" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "FK_21dcdbeff571151da91247f7614" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_b70c44e8b00757584a393225593" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "theme_preferences" ADD CONSTRAINT "FK_675fb847ac56640995ab5dbba51" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timezone_preferences" ADD CONSTRAINT "FK_b3a3b6b324743cc281721fdcfeb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profile_preferences" ADD CONSTRAINT "FK_6c47582d79921eb26a1bb5da3dd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "data_exports" ADD CONSTRAINT "FK_1230e97a87f9d23f8bbe2b157ee" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "data_exports" DROP CONSTRAINT "FK_1230e97a87f9d23f8bbe2b157ee"`);
        await queryRunner.query(`ALTER TABLE "profile_preferences" DROP CONSTRAINT "FK_6c47582d79921eb26a1bb5da3dd"`);
        await queryRunner.query(`ALTER TABLE "timezone_preferences" DROP CONSTRAINT "FK_b3a3b6b324743cc281721fdcfeb"`);
        await queryRunner.query(`ALTER TABLE "theme_preferences" DROP CONSTRAINT "FK_675fb847ac56640995ab5dbba51"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_b70c44e8b00757584a393225593"`);
        await queryRunner.query(`ALTER TABLE "dashboard_widgets" DROP CONSTRAINT "FK_21dcdbeff571151da91247f7614"`);
        await queryRunner.query(`ALTER TABLE "trend_data" DROP CONSTRAINT "FK_fea93c0be57b6e39a719563e259"`);
        await queryRunner.query(`ALTER TABLE "productivity_statistics" DROP CONSTRAINT "FK_db62fcfcc3f2d120e50e7b950d4"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
        await queryRunner.query(`ALTER TABLE "calendar_view_preferences" DROP CONSTRAINT "FK_2dc2d738a274989548c726becff"`);
        
        // Check if parentId foreign key exists before dropping it
        const parentIdFkExists = await queryRunner.query(`
            SELECT tc.constraint_name 
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'tasks' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'parentId'
        `);
        
        if (parentIdFkExists.length > 0) {
            await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_1cbec65196d4cf86dd8ab464085"`);
        }
        
        await queryRunner.query(`ALTER TABLE "time_entries" DROP CONSTRAINT "FK_8cfb57662e88d7c65010311661d"`);
        await queryRunner.query(`ALTER TABLE "time_entries" DROP CONSTRAINT "FK_d1b452d7f0d45863303b7d30000"`);
        await queryRunner.query(`ALTER TABLE "reminders" DROP CONSTRAINT "FK_fd166880b624ea8560667d43101"`);
        await queryRunner.query(`ALTER TABLE "reminders" DROP CONSTRAINT "FK_f8e4bc520d9e692652afaf3308b"`);
        // Skip dropping task_attachments table and constraints since they're handled in AddSubtasksAndAttachments migration
        
        // Check if position column exists before dropping it
        const positionColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'position'
        `);
        
        if (positionColumnExists.length > 0) {
            await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "position"`);
        }
        
        // Check if parentId column exists before dropping it
        const parentIdColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'parentId'
        `);
        
        if (parentIdColumnExists.length > 0) {
            await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "parentId"`);
        }
        
        await queryRunner.query(`DROP TABLE "data_exports"`);
        await queryRunner.query(`DROP TYPE "public"."data_exports_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."data_exports_datatype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."data_exports_format_enum"`);
        await queryRunner.query(`DROP TABLE "profile_preferences"`);
        await queryRunner.query(`DROP TABLE "timezone_preferences"`);
        await queryRunner.query(`DROP TABLE "theme_preferences"`);
        await queryRunner.query(`DROP TYPE "public"."theme_preferences_theme_enum"`);
        await queryRunner.query(`DROP TABLE "notification_preferences"`);
        await queryRunner.query(`DROP TABLE "dashboard_widgets"`);
        await queryRunner.query(`DROP TABLE "trend_data"`);
        await queryRunner.query(`DROP TABLE "productivity_statistics"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_relatedentitytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_channel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TABLE "calendar_view_preferences"`);
        await queryRunner.query(`DROP TYPE "public"."calendar_view_preferences_timeformat_enum"`);
        await queryRunner.query(`DROP TYPE "public"."calendar_view_preferences_defaultview_enum"`);
        await queryRunner.query(`DROP TABLE "time_entries"`);
        await queryRunner.query(`DROP TABLE "reminders"`);
        await queryRunner.query(`DROP TYPE "public"."reminders_timebefore_enum"`);
        // Skip dropping task_attachments table since it's handled in AddSubtasksAndAttachments migration
    }

}