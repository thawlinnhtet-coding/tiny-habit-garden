import type { NextRequest } from "next/server";
import { finishEmailConfirmation } from "../../../lib/auth-callback";

export function GET(request: NextRequest) {
  return finishEmailConfirmation(request);
}
