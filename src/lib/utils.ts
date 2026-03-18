export function formatDateTime(dateStr?: string | Date) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  
  // Format: "Mar 17, 2026, 10:30 AM"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatTime(dateStr?: string | Date) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDate(dateStr?: string | Date) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function timeAgo(dateStr?: string | Date) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatDate(d);
}
