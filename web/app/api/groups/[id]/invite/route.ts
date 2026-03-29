import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function getAuthUserId(request: NextRequest, session: any): number | null {
  if (session?.user?.id) return parseInt(session.user.id as string);
  const mobileId = request.headers.get("X-Mobile-User-Id");
  if (mobileId) return parseInt(mobileId);
  return null;
}

// POST: Generate (or return existing) invite token for the group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getAuthUserId(request, session);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const groupId = parseInt(id);

    // Must be a member to generate an invite
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const group = await (prisma.group as any).findUnique({ where: { id: groupId } });
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    // Return existing token or generate a new one
    let token = group.inviteToken;
    if (!token) {
      token = crypto.randomBytes(16).toString("hex");
      await (prisma.group as any).update({
        where: { id: groupId },
        data: { inviteToken: token },
      });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating invite token:", error);
    return NextResponse.json({ error: "Failed to generate invite" }, { status: 500 });
  }
}

// DELETE: Revoke the invite token (generates a new one on next POST)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getAuthUserId(request, session);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const groupId = parseInt(id);

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await (prisma.group as any).update({
      where: { id: groupId },
      data: { inviteToken: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking invite token:", error);
    return NextResponse.json({ error: "Failed to revoke invite" }, { status: 500 });
  }
}
