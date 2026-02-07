export function formatDate(date: Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatRelativeDate(date: Date | undefined): string {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `已过期 ${Math.abs(diffDays)} 天`;
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays === 2) return '后天';
  if (diffDays <= 7) return `${diffDays} 天后`;
  return formatDate(date);
}

export function isOverdue(date: Date | undefined): boolean {
  if (!date) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(date) < now;
}
