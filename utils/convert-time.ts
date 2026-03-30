type DisplayFormat = "text" | "short";

export function convertDateTime(
  isoString: string,
  format: DisplayFormat = "text",
): {
  date: string;
  time: string;
  datetime: string;
} {
  const date = new Date(isoString);

  // Dữ liệu backend trả về dạng UTC (vd: `...+00:00`).
  // Dùng `getUTC*` để tránh lệch ngày/giờ theo timezone máy người dùng.
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();

  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");

  // Dạng chữ
  const dateText = `Ngày ${day} tháng ${month} năm ${year}`;
  const timeText = `${hours} giờ ${minutes} phút ${seconds} giây`;

  // Dạng số ngắn
  const dateShort = `${day}/${month}/${year}`;
  const timeShort = `${hours}:${minutes}:${seconds}`;

  if (format === "short") {
    return {
      date: dateShort,
      time: timeShort,
      datetime: `${dateShort} ${timeShort}`,
    };
  }

  return {
    date: dateText,
    time: timeText,
    datetime: `${dateText} ${timeText}`,
  };
}
