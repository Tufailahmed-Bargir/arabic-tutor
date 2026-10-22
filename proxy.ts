import { NextResponse, type NextRequest } from "next/server";
import { getLesson } from "@/features/curriculum/lessons";

/** Cache Components streams the page shell first, so a missing lesson would answer 200. Reject it here instead. */
export function proxy(request: NextRequest) {
  const day = request.nextUrl.pathname.split("/")[2] ?? "";
  if (/^[1-9]\d*$/.test(day) && getLesson(Number(day)))
    return NextResponse.next();

  return NextResponse.rewrite(new URL("/not-found-lesson", request.url), {
    status: 404,
  });
}

export const config = { matcher: "/learn/:day" };
