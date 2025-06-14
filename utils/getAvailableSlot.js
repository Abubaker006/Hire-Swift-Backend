export function getNextAvailableSlot(date, START_HOUR, END_HOUR) {
  const startOfDay = new Date(date);
  startOfDay.setHours(START_HOUR, 0, 0, 0);

  if (date.getHours() < START_HOUR) {
    date.setHours(START_HOUR, 0, 0, 0);
  }

  while (true) {
    const hour = date.getHours();
    if (hour >= START_HOUR && hour < END_HOUR) {
      return new Date(date);
    }

    date.setDate(date.getDate() + 1);
    date.setHours(START_HOUR, 0, 0, 0);
  }
}