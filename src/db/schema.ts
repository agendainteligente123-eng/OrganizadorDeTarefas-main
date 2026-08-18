import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Supabase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tasks table (Routine definitions)
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.uid), // Using Supabase UID
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  label: text('label').notNull(),
  timeRange: text('time_range'),
  category: text('category').notNull(), // estudo, treino, idioma, extensao, outro
  createdAt: timestamp('created_at').defaultNow(),
});

// Completions table (Daily check-ins)
export const completions = pgTable('completions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.uid),
  taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // Expected format: YYYY-MM-DD
  completedAt: timestamp('completed_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  completions: many(completions),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.uid],
  }),
  completions: many(completions),
}));

export const completionsRelations = relations(completions, ({ one }) => ({
  user: one(users, {
    fields: [completions.userId],
    references: [users.uid],
  }),
  task: one(tasks, {
    fields: [completions.taskId],
    references: [tasks.id],
  }),
}));
