-- CreateIndex
CREATE INDEX "lors_institutionId_idx" ON "lors"("institutionId");

-- CreateIndex
CREATE INDEX "lors_teacherId_idx" ON "lors"("teacherId");

-- CreateIndex
CREATE INDEX "lors_studentId_idx" ON "lors"("studentId");

-- CreateIndex
CREATE INDEX "lors_status_idx" ON "lors"("status");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "users_institutionId_idx" ON "users"("institutionId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
