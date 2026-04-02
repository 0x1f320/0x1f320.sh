"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getStoredTheme(): Theme | null {
	if (typeof window === "undefined") return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark") return stored;
	return null;
}

function getResolvedTheme(): Theme {
	return getStoredTheme() ?? getSystemTheme();
}

function applyTheme(theme: Theme) {
	document.documentElement.classList.toggle("dark", theme === "dark");
}

const listeners = new Set<() => void>();
let currentTheme: Theme | undefined;

function subscribe(callback: () => void) {
	listeners.add(callback);
	return () => listeners.delete(callback);
}

function getSnapshot(): Theme {
	if (currentTheme === undefined) {
		currentTheme = document.documentElement.classList.contains("dark")
			? "dark"
			: "light";
	}
	return currentTheme;
}

function setTheme(theme: Theme) {
	localStorage.setItem(STORAGE_KEY, theme);
	applyTheme(theme);
	currentTheme = theme;
	for (const listener of listeners) listener();
}

export function useTheme() {
	const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark" as Theme);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => {
			if (!getStoredTheme()) {
				const resolved = getSystemTheme();
				applyTheme(resolved);
				currentTheme = resolved;
				for (const listener of listeners) listener();
			}
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const toggle = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme]);

	return { theme, toggle } as const;
}
