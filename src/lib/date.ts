const formatters: Record<string, Intl.DateTimeFormat> = {};

function getFormatter(locale: string): Intl.DateTimeFormat {
	if (!formatters[locale]) {
		formatters[locale] = new Intl.DateTimeFormat(locale, {
			month: "short",
			day: "numeric",
		});
	}
	return formatters[locale];
}

export function formatShortDate(dateStr: string, locale: string): string {
	const date = new Date(`${dateStr}T00:00:00`);
	return getFormatter(locale).format(date);
}
