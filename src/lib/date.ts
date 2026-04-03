import dayjs from "dayjs";
import "dayjs/locale/ko";

export function formatShortDate(dateStr: string, locale: string): string {
	const d = dayjs(dateStr).locale(locale);
	return locale === "ko" ? d.format("YYYY년 M월 D일") : d.format("MMM D, YYYY");
}
