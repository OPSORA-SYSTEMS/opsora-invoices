import { NextResponse } from "next/server";
import { startCronJobs } from "@/lib/cron";

// This route is called once to initialize cron jobs
// In production, the cron is initialized when the server starts

let initialized = false;

export async function GET() {
  if (!initialized) {
    startCronJobs();
    initialized = true;
    return NextResponse.json({ message: "Cron jobs initialized" });
  }
  return NextResponse.json({ message: "Cron jobs already running" });
}
