import { NextResponse } from "next/server";
import { ApiError } from "./auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ApiError) return err(error.message, error.status);
  if (error instanceof Error && "status" in error && typeof error.status === "number") {
    return err(error.message, error.status);
  }
  console.error(error);
  return err("Internal server error", 500);
}
