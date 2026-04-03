import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAllBlogPosts } from "@/lib/blog";
import { Link } from "@/i18n/navigation";
import { formatShortDate } from "@/lib/date";
import { YearIndicator } from "./year-indicator";

export default async function BlogPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("Blog");
	const posts = getAllBlogPosts(locale);

	const postsByYear = new Map<string, typeof posts>();
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
		<div>
			<h1 className="text-xl font-light text-[var(--color-text-muted)]">
				{t("title")}
			</h1>
			{posts.length === 0 ? (
				<p className="mt-8 text-sm text-[var(--color-text-subtle)]">
					{t("empty")}
				</p>
			) : (
				<div className="relative mt-8">
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
														{formatShortDate(post.date, locale)}
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
				</div>
			)}
		</div>
	);
}
