-- CreateEnum
CREATE TYPE "SkillAssessmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('junior', 'mid', 'senior');

-- CreateTable
CREATE TABLE "SkillAssessment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attendeeId" UUID NOT NULL,
    "webinarId" UUID NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'mid',
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxPossibleScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assessmentData" JSONB NOT NULL DEFAULT '[]',
    "status" "SkillAssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillAssessment_webinarId_idx" ON "SkillAssessment"("webinarId");

-- CreateIndex
CREATE INDEX "SkillAssessment_status_idx" ON "SkillAssessment"("status");

-- CreateIndex
CREATE INDEX "SkillAssessment_role_idx" ON "SkillAssessment"("role");

-- CreateIndex
CREATE UNIQUE INDEX "SkillAssessment_attendeeId_webinarId_key" ON "SkillAssessment"("attendeeId", "webinarId");

-- AddForeignKey
ALTER TABLE "SkillAssessment" ADD CONSTRAINT "SkillAssessment_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAssessment" ADD CONSTRAINT "SkillAssessment_webinarId_fkey" FOREIGN KEY ("webinarId") REFERENCES "Webinar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
