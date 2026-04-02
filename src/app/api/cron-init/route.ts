import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startCronJobs } from "@/lib/cron";

let initialized = false;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!initialized) {
    startCronJobs();
    initialized = true;
    return NextResponse.json({ message: "Cron jobs initialized" });
  }
  return NextResponse.json({ message: "Cron jobs already running" });
}
