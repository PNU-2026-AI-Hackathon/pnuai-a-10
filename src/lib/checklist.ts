import type { ChecklistItem, ChecklistPriority } from "../types/analysis";
import { actionRules } from "../data/actionRules";

const priorityOrder: Record<ChecklistPriority, number> = {
  "즉시 조치": 1,
  "1주 이내 확인": 2,
  "필요 시 관리": 3,
};

export function buildChecklist(leakedItems: string[]): ChecklistItem[] {
  const checklist: ChecklistItem[] = [];

  leakedItems.forEach((item) => {
    const rules = actionRules[item];

    if (rules) {
      checklist.push(...rules);
    }
  });

  const uniqueChecklist = new Map<string, ChecklistItem>();

  checklist.forEach((item) => {
    uniqueChecklist.set(item.id, {
      ...item,
      isCompleted: item.isCompleted ?? false,
    });
  });

  return Array.from(uniqueChecklist.values()).sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function calculateChecklistProgress(checklist: ChecklistItem[]): number {
  if (checklist.length === 0) {
    return 0;
  }

  const completedCount = checklist.filter((item) => item.isCompleted).length;

  return Math.round((completedCount / checklist.length) * 100);
}