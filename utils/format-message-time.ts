import { isToday, isYesterday } from "date-fns";

export const formatMessageTime = (timestamp: string) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  const formatUTC = (d: Date) => {
    const h = d.getUTCHours().toString().padStart(2, "0");
    const m = d.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatDateUTC = (d: Date) => {
    const day = d.getUTCDate().toString().padStart(2, "0");
    const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = d.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };

  if (isToday(date)) {
    return formatUTC(date);
  }

  if (isYesterday(date)) {
    return `Hôm qua, ${formatUTC(date)}`;
  }

  if (date.getUTCFullYear() === new Date().getUTCFullYear()) {
    return `${formatDateUTC(date).slice(0, 5)}, lúc ${formatUTC(date)}`;
  }

  return `${formatDateUTC(date)}, lúc ${formatUTC(date)}`;
};
