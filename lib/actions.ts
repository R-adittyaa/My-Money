// lib/actions.ts
"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { saveInsightSettings, InsightSettingsType } from "@/lib/storage";

export async function saveInsightSettingsAction(settings: InsightSettingsType) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Panggil fungsi asli dari storage
  await saveInsightSettings(session.user.id, settings);

  // Segarkan halaman agar perubahan langsung terlihat
  revalidatePath("/");
  revalidatePath("/pengaturan");

  return { success: true };
}