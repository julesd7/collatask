const { pgTable, uuid, varchar, text, timestamp, integer, date, boolean } = require('drizzle-orm/pg-core');

// Projects Table
const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  owner_id: uuid('owner_id').references(() => users.id),
});

// Users Table
const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  created_at: timestamp('created_at').defaultNow(),
  verified: boolean('verified').default(false),
  verification_token: varchar('verification_token', { length: 255 }),
  reset_token: varchar('reset_token', { length: 255 }),
  last_connection: timestamp('last_connection').defaultNow(),
});

// Boards Table
const boards = pgTable('boards', {
  id: uuid('id').defaultRandom().primaryKey(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  title: varchar('title', { length: 255 }).notNull(),
  project_id: uuid('project_id').references(() => projects.id),
});

// Cards Table
const cards = pgTable('cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  start_date: date('start_date'),
  end_date: date('end_date'),
  last_change: timestamp('last_change').defaultNow(),
  board_id: uuid('board_id').references(() => boards.id),
  project_id: uuid('project_id').references(() => projects.id),
  assignees_ids: uuid('assignees_ids'),
});

// Project Assignments Table
const projectAssignments = pgTable('project_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: varchar('role', { length: 20 }).default('viewer'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  user_id: uuid('user_id').references(() => users.id),
  project_id: uuid('project_id').references(() => projects.id),
});

// Tasks Table
const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('pending'),
  board_id: integer('board_id').notNull(),
  assigned_to: integer('assigned_to'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Message Table
const messages = pgTable("messages", {
  id: uuid('id').defaultRandom().primaryKey(),
  sender: text("sender").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

module.exports = { projects, users, boards, cards, projectAssignments, tasks, messages };
