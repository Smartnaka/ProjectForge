-- Production readiness indexes and constraints for ProjectForge.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Project_ownerId_name_key" ON "Project"("ownerId", "name");
CREATE INDEX IF NOT EXISTS "Project_ownerId_status_updatedAt_idx" ON "Project"("ownerId", "status", "updatedAt");
CREATE INDEX IF NOT EXISTS "Project_ownerId_priority_idx" ON "Project"("ownerId", "priority");
CREATE INDEX IF NOT EXISTS "Project_archivedAt_idx" ON "Project"("archivedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_projectId_name_key" ON "Tag"("projectId", "name");
CREATE INDEX IF NOT EXISTS "Tag_name_idx" ON "Tag"("name");
CREATE INDEX IF NOT EXISTS "Requirement_projectId_position_idx" ON "Requirement"("projectId", "position");
CREATE INDEX IF NOT EXISTS "UserStory_projectId_status_priority_idx" ON "UserStory"("projectId", "status", "priority");
CREATE INDEX IF NOT EXISTS "Feature_projectId_status_priority_idx" ON "Feature"("projectId", "status", "priority");
CREATE UNIQUE INDEX IF NOT EXISTS "DbTable_projectId_name_key" ON "DbTable"("projectId", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "DbColumn_tableId_name_key" ON "DbColumn"("tableId", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "ApiEndpoint_projectId_method_route_key" ON "ApiEndpoint"("projectId", "method", "route");
CREATE INDEX IF NOT EXISTS "ApiEndpoint_projectId_authRequired_idx" ON "ApiEndpoint"("projectId", "authRequired");
CREATE INDEX IF NOT EXISTS "Task_projectId_status_position_idx" ON "Task"("projectId", "status", "position");
CREATE UNIQUE INDEX IF NOT EXISTS "Document_projectId_title_key" ON "Document"("projectId", "title");
CREATE INDEX IF NOT EXISTS "Note_projectId_idx" ON "Note"("projectId");
CREATE INDEX IF NOT EXISTS "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");
