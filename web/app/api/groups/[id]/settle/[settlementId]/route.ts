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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; settlementId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getAuthUserId(request, session);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, settlementId } = await params;
    const groupId = parseInt(id);
    const sId = parseInt(settlementId);

    // Verify caller is a member of this group
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch the settlement to check ownership
    const settlement = await prisma.settlement.findUnique({
      where: { id: sId },
    });
    if (!settlement) {
      return NextResponse.json({ error: "Settlement not found" }, { status: 404 });
    }
    if (settlement.groupId !== groupId) {
      return NextResponse.json({ error: "Settlement does not belong to this group" }, { status: 403 });
    }

    // Only the two people involved in this settlement can delete it
    if (userId !== settlement.fromUserId && userId !== settlement.toUserId) {
      return NextResponse.json(
        { error: "You can only delete settlements you are directly involved in" },
        { status: 403 }
      );
    }

    await prisma.settlement.delete({ where: { id: sId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting settlement:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
