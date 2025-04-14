export const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return 'právě teď';
  } else if (minutes < 60) {
    return `před ${minutes} minutami`;
  } else if (hours < 24) {
    return `před ${hours} hodinami`;
  } else if (days < 7) {
    return `před ${days} dny`;
  } else {
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}; 