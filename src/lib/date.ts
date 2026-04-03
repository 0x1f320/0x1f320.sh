import dayjs from "dayjs";
import "dayjs/locale/ko";

export function formatShortDate(
	dateStr: string,
	locale: string,
	{ omitYear }: { omitYear?: boolean } = {},
): string {
	const d = dayjs(dateStr).locale(locale);
	if (omitYear) {
		return locale === "ko" ? d.format("M월 D일") : d.format("MMM D");
	}
	return locale === "ko" ? d.format("YYYY년 M월 D일") : d.format("MMM D, YYYY");
}
