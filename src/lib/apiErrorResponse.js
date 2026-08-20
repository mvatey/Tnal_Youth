import { NextResponse } from "next/server";

export function apiErrorResponse(errorCode, message, status, details) {
  return NextResponse.json(
    {
      success: false,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      ...(details === undefined ? {} : { details }),
    },
    { status },
  );
}
