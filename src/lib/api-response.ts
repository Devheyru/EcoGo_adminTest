import { NextResponse } from "next/server";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
};

export function successResponse<T>(
  data: T,
  status = 200,
  meta?: Record<string, any>
) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data, meta },
    { status }
  );
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json<ApiResponse<null>>(
    { success: false, error: message },
    { status }
  );
}
