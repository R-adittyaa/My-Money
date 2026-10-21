import { auth } from "@/auth";
import {
  getUserById,
  updateUserPassword,
  verifyPassword,
} from "@/lib/auth-helpers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const oldPassword = (body.oldPassword || "").trim();
    const newPassword = (body.newPassword || "").trim();

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal 6 karakter" },
        { status: 400 }
      );
    }

    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User gak ada" }, { status: 404 });
    }

    const valid = await verifyPassword(user, oldPassword);
    if (!valid) {
      return NextResponse.json(
        { error: "Password lama salah" },
        { status: 400 }
      );
    }

    await updateUserPassword(user.id, newPassword);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal ganti password" },
      { status: 400 }
    );
  }
}