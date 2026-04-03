"use client";

import * as runtime from "react/jsx-runtime";

const useMDXComponent = (code: string) => {
	const fn = new Function(code);
	return fn({ ...runtime }).default;
};

export function MDXContent({
	code,
	components,
}: {
	code: string;
	components?: Record<string, React.ComponentType>;
}) {
	const Component = useMDXComponent(code);
	return <Component components={components} />;
}
