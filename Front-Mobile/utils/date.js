const two = (n) => String(n).padStart(2, '0');

export const formatTime = (date) => `${two(date.getHours())}:${two(date.getMinutes())}`;
export const getDateISO = (d = new Date()) => d.toISOString().split('T')[0];

export const getWeekDays = (startDate = new Date()) => {
  const days = [];
  const start = new Date(startDate);
  const dayOfWeek = start.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  start.setDate(start.getDate() - daysFromMonday);
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const weekNames = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
    days.push({
      date: getDateISO(day),
      dayName: weekNames[i],
      dayNumber: day.getDate()
    });
  }
  return days;
};
