export function formatDate(value) {
  return new Date(value).toLocaleString([], { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
