"use client";

import { useCallback, useEffect, useState } from "react";

export function YearIndicator({ years }: { years: string[] }) {
	const [activeYear, setActiveYear] = useState(years[0] ?? "");

	const update = useCallback(() => {
		const sections =
			document.querySelectorAll<HTMLElement>("[data-year]");
		let current = years[0];
		for (const section of sections) {
			if (section.getBoundingClientRect().top <= 24) {
				current = section.dataset.year ?? current;
			}
		}
		setActiveYear(current);
	}, [years]);

	useEffect(() => {
		update();
		document.addEventListener("scroll", update, { passive: true });
		return () => document.removeEventListener("scroll", update);
	}, [update]);

	const scrollToYear = useCallback((year: string) => {
		const section = document.querySelector<HTMLElement>(
			`[data-year="${year}"]`,
		);
		if (section) {
			section.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, []);

	return (
		<nav className="sticky top-16 -ml-20 hidden w-16 float-left h-0 overflow-visible lg:block">
			<ul className="flex flex-col items-end gap-2">
				{years.map((year) => (
					<li key={year}>
						<button
							type="button"
							onClick={() => scrollToYear(year)}
							className={`text-sm transition-colors ${
								activeYear === year
									? "text-[var(--color-text)] font-medium"
									: "text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]"
							}`}
						>
							{year}
						</button>
					</li>
				))}
			</ul>
		</nav>
	);
}
