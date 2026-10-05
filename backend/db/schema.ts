import {integer,sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const cmsEntries=sqliteTable('cms_entries',{
 key:text('key').primaryKey(),kind:text('kind').notNull(),draftJson:text('draft_json').notNull(),publishedJson:text('published_json'),version:integer('version').notNull().default(0),publishedVersion:integer('published_version').notNull().default(0),updatedAt:text('updated_at').notNull(),publishedAt:text('published_at')
});
export const cmsRevisions=sqliteTable('cms_revisions',{
 id:text('id').primaryKey(),entryKey:text('entry_key').notNull(),version:integer('version').notNull(),contentJson:text('content_json').notNull(),action:text('action').notNull(),createdAt:text('created_at').notNull()
});
export const cmsMedia=sqliteTable('cms_media',{
 id:text('id').primaryKey(),name:text('name').notNull(),mime:text('mime').notNull(),size:integer('size').notNull(),createdAt:text('created_at').notNull()
});
