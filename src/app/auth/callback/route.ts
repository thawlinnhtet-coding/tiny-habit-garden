import type { NextRequest } from "next/server";
import { finishAuthCallback } from "../../../lib/auth-callback";

export function GET(request: NextRequest) {
  return finishAuthCallback(request, "oauth");
}
