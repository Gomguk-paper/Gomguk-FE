// Re-export from models for backward compatibility
export type { Paper, Summary } from "@/models";
// NOTE: papers, allTags는 MyPage, NotificationList, Onboarding에서 아직 사용 중이므로 유지
export { papers, allTags } from "@/models/papers";
