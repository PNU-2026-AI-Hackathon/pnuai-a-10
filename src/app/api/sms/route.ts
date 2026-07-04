import { NextResponse } from "next/server";
import { analyzeSuspiciousMessage } from "../../../lib/gemini";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      inputText?: string;
    } | null;

    const inputText = body?.inputText?.trim();

    if (!inputText) {
      return NextResponse.json(
        { message: "inputText가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await analyzeSuspiciousMessage(inputText);

    return NextResponse.json({
      ...result,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "의심 문자 분석 중 알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        message,
      },
      { status: 500 }
    );
  }
}