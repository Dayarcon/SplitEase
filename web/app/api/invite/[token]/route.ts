import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getAuthUserId(request: NextRequest, session: any): number | null {
  if (session?.user?.id) return parseInt(session.user.id as string);
  const mobileId = request.headers.get("X-Mobile-User-Id");
  if (mobileId) return parseInt(mobileId);
  return null;
}

// GET: Public - return group info for the invite page (no auth needed)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const group = await (prisma.group as any).findUnique({
      where: { inviteToken: token },
      include: {
        members: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 404 });
    }

    // Check if current user is already a member
    const session = await getServerSession(authOptions);
    let alreadyMember = false;
    if (session?.user?.id) {
      const userId = parseInt(session.user.id as string);
      alreadyMember = group.members.some((m: any) => m.user.id === userId);
    }

    return NextResponse.json({
      id: group.id,
      name: group.name,
      emoji: group.emoji,
      currency: group.currency,
      memberCount: group.members.length,
      members: group.members.map((m: any) => ({ id: m.user.id, name: m.user.name })),
      alreadyMember,
    });
  } catch (error) {
    console.error("Error fetching invite:", error);
    return NextResponse.json({ error: "Failed to fetch invite" }, { status: 500 });
  }
}

// POST: Authenticated - join the group via invite token
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getAuthUserId(request, session);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { token } = await params;

    const group = await (prisma.group as any).findUnique({
      where: { inviteToken: token },
      include: { members: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 404 });
    }

    // Check if already a member
    const alreadyMember = group.members.some((m: any) => m.userId === userId);
    if (alreadyMember) {
      return NextResponse.json({ groupId: group.id, alreadyMember: true });
    }

    // Add the user to the group
    await prisma.groupMember.create({
      data: { groupId: group.id, userId },
    });

    return NextResponse.json({ groupId: group.id, alreadyMember: false });
  } catch (error) {
    console.error("Error joining group:", error);
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}
