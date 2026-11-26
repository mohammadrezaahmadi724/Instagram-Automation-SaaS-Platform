-- CreateEnum
CREATE TYPE "instagram_account_status" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED', 'ERROR');

-- CreateEnum
CREATE TYPE "automation_status" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "automation_trigger_type" AS ENUM ('POST_COMMENT', 'LIVE_COMMENT', 'DM', 'STORY_REPLY');

-- CreateEnum
CREATE TYPE "media_scope" AS ENUM ('ALL', 'SPECIFIC');

-- CreateEnum
CREATE TYPE "keyword_match_type" AS ENUM ('EXACT', 'CONTAINS', 'ANY');

-- CreateEnum
CREATE TYPE "webhook_event_status" AS ENUM ('RECEIVED', 'QUEUED', 'PROCESSED', 'FAILED', 'IGNORED');

-- CreateEnum
CREATE TYPE "automation_log_status" AS ENUM ('SUCCESS', 'FAILED', 'SKIPPED_WINDOW', 'SKIPPED_COOLDOWN', 'RATE_LIMITED');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('CARD_TO_CARD', 'GATEWAY');

-- CreateEnum
CREATE TYPE "payment_receipt_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_super_admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "active_workspace_id" UUID,
    "ip_hash" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" UUID NOT NULL,
    "phone_e164" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_accounts" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "ig_user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "profile_picture_url" TEXT,
    "followers_count" INTEGER,
    "account_type" TEXT,
    "access_token_enc" TEXT,
    "token_key_id" TEXT,
    "token_expires_at" TIMESTAMPTZ(3),
    "scopes" TEXT[],
    "status" "instagram_account_status" NOT NULL DEFAULT 'ACTIVE',
    "webhook_subscribed" BOOLEAN NOT NULL DEFAULT false,
    "connected_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "instagram_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "instagram_account_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "automation_status" NOT NULL DEFAULT 'DRAFT',
    "trigger_type" "automation_trigger_type" NOT NULL,
    "media_scope" "media_scope" NOT NULL DEFAULT 'ALL',
    "media_id" TEXT,
    "match_type" "keyword_match_type" NOT NULL DEFAULT 'CONTAINS',
    "keywords" TEXT[],
    "reply_text" TEXT,
    "reply_buttons_json" JSONB,
    "public_comment_reply_text" TEXT,
    "send_private_reply" BOOLEAN NOT NULL DEFAULT true,
    "cooldown_seconds" INTEGER NOT NULL DEFAULT 0,
    "execution_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL,
    "external_event_id" TEXT NOT NULL,
    "workspace_id" UUID,
    "instagram_account_id" UUID,
    "source" TEXT NOT NULL DEFAULT 'INSTAGRAM',
    "event_type" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "status" "webhook_event_status" NOT NULL DEFAULT 'RECEIVED',
    "error_message" TEXT,
    "received_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(3),

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_logs" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "instagram_account_id" UUID NOT NULL,
    "rule_id" UUID,
    "webhook_event_id" UUID,
    "igsid" TEXT NOT NULL,
    "trigger_type" "automation_trigger_type" NOT NULL,
    "matched_keyword" TEXT,
    "action_type" TEXT NOT NULL,
    "status" "automation_log_status" NOT NULL,
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name_fa" TEXT NOT NULL,
    "price_rial" BIGINT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "max_instagram_accounts" INTEGER NOT NULL,
    "max_monthly_executions" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "min_followers" INTEGER NOT NULL DEFAULT 0,
    "max_followers" INTEGER,
    "features_json" JSONB,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "subscription_status" NOT NULL DEFAULT 'TRIAL',
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_receipts" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "subscription_id" UUID,
    "plan_id" UUID NOT NULL,
    "method" "payment_method" NOT NULL,
    "amount_rial" BIGINT NOT NULL,
    "reference_code" TEXT NOT NULL,
    "receipt_image_url" TEXT,
    "status" "payment_receipt_status" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_user_id" UUID,
    "review_note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(3),

    CONSTRAINT "payment_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_expires_at_idx" ON "sessions"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "otp_codes_phone_e164_created_at_idx" ON "otp_codes"("phone_e164", "created_at");

-- CreateIndex
CREATE INDEX "otp_codes_phone_e164_consumed_at_idx" ON "otp_codes"("phone_e164", "consumed_at");

-- CreateIndex
CREATE INDEX "instagram_accounts_workspace_id_idx" ON "instagram_accounts"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_accounts_workspace_id_ig_user_id_key" ON "instagram_accounts"("workspace_id", "ig_user_id");

-- CreateIndex
CREATE INDEX "automation_rules_workspace_id_idx" ON "automation_rules"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_external_event_id_key" ON "webhook_events"("external_event_id");

-- CreateIndex
CREATE INDEX "webhook_events_workspace_id_idx" ON "webhook_events"("workspace_id");

-- CreateIndex
CREATE INDEX "automation_logs_workspace_id_created_at_idx" ON "automation_logs"("workspace_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");

-- CreateIndex
CREATE INDEX "subscriptions_workspace_id_idx" ON "subscriptions"("workspace_id");

-- CreateIndex
CREATE INDEX "payment_receipts_workspace_id_idx" ON "payment_receipts"("workspace_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_active_workspace_id_fkey" FOREIGN KEY ("active_workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_accounts" ADD CONSTRAINT "instagram_accounts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_instagram_account_id_fkey" FOREIGN KEY ("instagram_account_id") REFERENCES "instagram_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_instagram_account_id_fkey" FOREIGN KEY ("instagram_account_id") REFERENCES "instagram_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_instagram_account_id_fkey" FOREIGN KEY ("instagram_account_id") REFERENCES "instagram_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automation_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_webhook_event_id_fkey" FOREIGN KEY ("webhook_event_id") REFERENCES "webhook_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
