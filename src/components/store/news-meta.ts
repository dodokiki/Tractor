// เมตาข้อมูลกลุ่มข่าว ใช้ร่วมกันระหว่างหน้าแรก /news และ /news/[id]
export const NEWS_GROUPS = [
  { value: "CONSTRUCTION", emoji: "🏗️", label: "เครื่องจักรก่อสร้าง" },
  { value: "AGRICULTURE", emoji: "🌾", label: "เครื่องจักรเกษตร" },
  { value: "PLATFORM", emoji: "🛠️", label: "ข่าวแพลตฟอร์มและอุตสาหกรรม" },
] as const;

export type NewsGroupValue = (typeof NEWS_GROUPS)[number]["value"];

const GROUP_MAP = new Map(NEWS_GROUPS.map((g) => [g.value, g]));

export function newsGroupMeta(group: string) {
  return GROUP_MAP.get(group as NewsGroupValue) ?? { value: group, emoji: "📰", label: group };
}
