-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('IDLE', 'RECORDING', 'PAUSED', 'COMPLETED', 'ERROR');

-- CreateTable
CREATE TABLE "recording_sessions" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "targetUrl" TEXT NOT NULL,
    "status" "RecordingStatus" NOT NULL DEFAULT 'IDLE',
    "actions" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "generatedCode" TEXT,
    "browserType" TEXT NOT NULL DEFAULT 'chromium',
    "viewport" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "appId" TEXT,

    CONSTRAINT "recording_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recording_sessions_userId_createdAt_idx" ON "recording_sessions"("userId", "createdAt");

