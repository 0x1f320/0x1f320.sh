"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { formatShortDate } from "@/lib/date";
import { YearIndicator } from "./year-indicator";

interface Post {
	slug: string;
	title: string;
	date: string;
	description?: string;
}

export function BlogList({
	posts,
	locale,
	compactOnLabel,
	compactOffLabel,
}: {
	posts: Post[];
	locale: string;
	compactOnLabel: string;
	compactOffLabel: string;
}) {
	const [compact, setCompact] = useState(false);

	const postsByYear = new Map<string, Post[]>();
	for (const post of posts) {
		const year = post.date.slice(0, 4);
		const group = postsByYear.get(year);
		if (group) {
			group.push(post);
		} else {
			postsByYear.set(year, [post]);
		}
	}

	const years = [...postsByYear.keys()];

	return (
		<div className="relative mt-8">
			<div className="flex items-center justify-end mb-6">
				<button
					type="button"
					onClick={() => setCompact((v) => !v)}
					className="text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)] transition-colors"
				>
					{compact ? compactOffLabel : compactOnLabel}
				</button>
			</div>

			{compact ? (
				<ul className="space-y-2">
					{posts.map((post) => (
						<li key={post.slug}>
							<Link
								href={`/blog/${post.slug}`}
								className="flex items-baseline justify-between gap-4 group"
							>
								<span className="font-light text-[var(--color-text)] group-hover:text-[var(--color-text-muted)] transition-colors truncate">
									{post.title}
								</span>
								<span className="text-sm text-[var(--color-text-subtle)] shrink-0">
									{formatShortDate(post.date, locale)}
								</span>
							</Link>
						</li>
					))}
				</ul>
			) : (
				<>
					<YearIndicator years={years} />
					<div className="space-y-10">
						{years.map((year, yi) => (
							<div key={year}>
								{yi > 0 && (
									<hr
										data-separator={year}
										className="mb-10 border-t border-[var(--color-text-subtle)] opacity-30"
									/>
								)}
								<div data-year={year}>
									<div className="text-sm text-[var(--color-text-subtle)] mb-4 lg:hidden">
										{year}
									</div>
									<ul className="space-y-6">
										{postsByYear.get(year)?.map((post) => (
											<li key={post.slug}>
												<Link
													href={`/blog/${post.slug}`}
													className="group block"
												>
													<span className="text-sm text-[var(--color-text-subtle)]">
														{formatShortDate(post.date, locale, { omitYear: true })}
													</span>
													<h2 className="mt-1 font-light text-[var(--color-text)] group-hover:text-[var(--color-text-muted)] transition-colors">
														{post.title}
													</h2>
													{post.description && (
														<p className="mt-2 text-sm text-[var(--color-text-subtle)]">
															{post.description}
														</p>
													)}
												</Link>
											</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}
