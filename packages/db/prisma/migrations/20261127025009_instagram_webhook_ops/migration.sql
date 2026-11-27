-- CreateEnum
CREATE TYPE "data_deletion_status" AS ENUM ('RECEIVED', 'COMPLETED');

-- AlterEnum
ALTER TYPE "automation_log_status" ADD VALUE 'SKIPPED_PLAN_LIMIT';

-- CreateTable
CREATE TABLE "data_deletion_requests" (
    "id" UUID NOT NULL,
    "confirmation_code" TEXT NOT NULL,
    "ig_user_id" TEXT,
    "status" "data_deletion_status" NOT NULL DEFAULT 'RECEIVED',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "data_deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_deletion_requests_confirmation_code_key" ON "data_deletion_requests"("confirmation_code");
