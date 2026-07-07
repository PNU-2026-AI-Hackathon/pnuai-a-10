import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type {
  AnalysisType,
  ChecklistItem,
  RiskLevel,
} from "../../../types/analysis";

type HistoryRow = {
  id: string;
  user_id: string;
  type: AnalysisType;
  title: string;
  company: string | null;
  risk_level: RiskLevel;
  leaked_items: string[];
  risk_types: string[];
  checklist: ChecklistItem[];
  checklist_progress: number;
  result_summary: string | null;
  created_at: string;
};

function toHistoryItem(row: HistoryRow) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    company: row.company ?? undefined,
    riskLevel: row.risk_level,
    leakedItems: row.leaked_items,
    riskTypes: row.risk_types,
    checklist: row.checklist,
    checklistProgress: row.checklist_progress,
    resultSummary: row.result_summary ?? undefined,
    createdAt: row.created_at,
  };
}

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("history")
    .select(
      "id, user_id, type, title, company, risk_level, leaked_items, risk_types, checklist, checklist_progress, result_summary, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        error: "이력 조회에 실패했습니다.",
        detail: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    history: (data ?? []).map((row) => toHistoryItem(row as HistoryRow)),
  });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const type = body.type as AnalysisType | undefined;
  const riskLevel = body.riskLevel as RiskLevel | undefined;

  if (type !== "leak" && type !== "sms") {
    return NextResponse.json(
      { error: "type은 leak 또는 sms여야 합니다." },
      { status: 400 }
    );
  }

  if (riskLevel !== "낮음" && riskLevel !== "보통" && riskLevel !== "높음") {
    return NextResponse.json(
      { error: "riskLevel은 낮음, 보통, 높음 중 하나여야 합니다." },
      { status: 400 }
    );
  }

  const title =
    typeof body.title === "string" && body.title.trim().length > 0
      ? body.title.trim()
      : type === "leak"
        ? "유출 안내문 분석"
        : "의심 문자 분석";

  const insertData = {
    user_id: user.id,
    type,
    title,
    company: typeof body.company === "string" ? body.company : null,
    risk_level: riskLevel,
    leaked_items: Array.isArray(body.leakedItems) ? body.leakedItems : [],
    risk_types: Array.isArray(body.riskTypes) ? body.riskTypes : [],
    checklist: Array.isArray(body.checklist) ? body.checklist : [],
    checklist_progress:
      typeof body.checklistProgress === "number" ? body.checklistProgress : 0,
    result_summary:
      typeof body.resultSummary === "string" ? body.resultSummary : null,
  };

  const { data, error } = await supabase
    .from("history")
    .insert(insertData)
    .select(
      "id, user_id, type, title, company, risk_level, leaked_items, risk_types, checklist, checklist_progress, result_summary, created_at"
    )
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: "이력 저장에 실패했습니다.",
        detail: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      history: toHistoryItem(data as HistoryRow),
    },
    { status: 201 }
  );
}