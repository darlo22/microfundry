import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./schema";

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'update', 'investment', 'security', 'general'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").defaultTo(false),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: text("metadata"), // JSON string for additional data
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;