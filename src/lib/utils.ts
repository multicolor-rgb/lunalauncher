export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function formatDuration(totalSeconds: number, language: "pl" | "en"): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return language === "pl" ? `${hours} godz. ${minutes} min` : `${hours} h ${minutes} min`;
  }
  if (minutes > 0) {
    return language === "pl" ? `${minutes} min` : `${minutes} min`;
  }
  return language === "pl" ? `${seconds} s` : `${seconds} s`;
}

export function formatClock(timestamp: number, language: "pl" | "en" = "pl"): string {
  return new Date(timestamp).toLocaleTimeString(language === "pl" ? "pl-PL" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(timestamp: number, language: "pl" | "en"): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return language === "pl" ? "teraz" : "just now";
  if (minutes < 60) return language === "pl" ? `${minutes} min temu` : `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return language === "pl" ? `${hours} godz. temu` : `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return language === "pl" ? `${days} dni temu` : `${days} days ago`;
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

const CUSTOM_ACCENTS: Array<[string, string]> = [
  ["#7c5cff", "#22d3ee"],
  ["#ff5f8f", "#7c5cff"],
  ["#f59e0b", "#ef4444"],
  ["#10b981", "#22d3ee"],
  ["#8b5cf6", "#f472b6"],
  ["#38bdf8", "#818cf8"],
];

export function accentFor(value: string): [string, string] {
  return CUSTOM_ACCENTS[hashString(value) % CUSTOM_ACCENTS.length];
}

export function initials(title: string): string {
  return title
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
