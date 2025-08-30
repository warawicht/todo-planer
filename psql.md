/ # psql -d todo_planner_dev -U todo_planner_user
psql (15.14)
Type "help" for help.

todo_planner_dev=# \c todo_planner_dev
You are now connected to database "todo_planner_dev" as user "todo_planner_user"

todo_planner_dev=# \l
                                                                 List of databases
       Name       |       Owner       | Encoding |  Collate   |   Ctype    | ICU Locale | Locale Provider |            Access privileges            
------------------+-------------------+----------+------------+------------+------------+-----------------+-----------------------------------------
 postgres         | todo_planner_user | UTF8     | en_US.utf8 | en_US.utf8 |            | libc            | 
 template0        | todo_planner_user | UTF8     | en_US.utf8 | en_US.utf8 |            | libc            | =c/todo_planner_user                   +
                  |                   |          |            |            |            |                 | todo_planner_user=CTc/todo_planner_user
 template1        | todo_planner_user | UTF8     | en_US.utf8 | en_US.utf8 |            | libc            | =c/todo_planner_user                   +
                  |                   |          |            |            |            |                 | todo_planner_user=CTc/todo_planner_user
 todo_planner_dev | todo_planner_user | UTF8     | en_US.utf8 | en_US.utf8 |            | libc            | 
(4 rows)

todo_planner_dev=#  \dt
                       List of relations
 Schema |           Name            | Type  |       Owner       
--------+---------------------------+-------+-------------------
 public | activity_logs             | table | todo_planner_user
 public | analytics_exports         | table | todo_planner_user
 public | audit_trails              | table | todo_planner_user
 public | calendar_view_preferences | table | todo_planner_user
 public | dashboard_widgets         | table | todo_planner_user
 public | data_exports              | table | todo_planner_user
 public | goals                     | table | todo_planner_user
 public | insights                  | table | todo_planner_user
 public | migrations                | table | todo_planner_user
 public | notification_preferences  | table | todo_planner_user
 public | notifications             | table | todo_planner_user
 public | permissions               | table | todo_planner_user
 public | productivity_statistics   | table | todo_planner_user
 public | profile_preferences       | table | todo_planner_user
 public | projects                  | table | todo_planner_user
 public | refresh_tokens            | table | todo_planner_user
 public | reminders                 | table | todo_planner_user
 public | report_templates          | table | todo_planner_user
 public | role_permissions          | table | todo_planner_user
 public | roles                     | table | todo_planner_user
 public | tags                      | table | todo_planner_user
 public | task_assignments          | table | todo_planner_user
 public | task_attachments          | table | todo_planner_user
 public | task_comments             | table | todo_planner_user
 public | task_shares               | table | todo_planner_user
 public | task_tags                 | table | todo_planner_user
 public | tasks                     | table | todo_planner_user
 public | theme_preferences         | table | todo_planner_user
 public | time_blocks               | table | todo_planner_user
 public | time_entries              | table | todo_planner_user
 public | timezone_preferences      | table | todo_planner_user
 public | trend_data                | table | todo_planner_user
 public | user_availability         | table | todo_planner_user
 public | user_roles                | table | todo_planner_user
 public | users                     | table | todo_planner_user
 public | workflow_instances        | table | todo_planner_user
 public | workflows                 | table | todo_planner_user
(37 rows)

