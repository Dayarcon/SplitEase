-- Add inviteToken field to Group for shareable invite links
ALTER TABLE "Group" ADD COLUMN "inviteToken" TEXT;
CREATE UNIQUE INDEX "Group_inviteToken_key" ON "Group"("inviteToken");
