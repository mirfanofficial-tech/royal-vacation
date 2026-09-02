"use client";

import { useEffect } from "react";

import type { AdminCornerStyle, SiteThemeOut } from "@royal-vacation/api-client";
import { useThemeQuery } from "@/lib/theme";

/** The subset of the site theme that recolours the admin panel itself. */
export type AdminThemeFields = Pick<
  SiteThemeOut,
  | "admin_sidebar_color"
  | "admin_sidebar_text_color"
  | "admin_primary_color"
  | "admin_accent_color"
  | "admin_corner_style"
>;

export const CORNER_RADIUS: Record<AdminCornerStyle, string> = {
  sharp: "0.25rem",
  soft: "0.625rem",
  round: "1rem",
};

function setVar(el: HTMLElement, name: string, value: string | null) {
  if (value) el.style.setProperty(name, value);
  else el.style.removeProperty(name);
}

/**
 * Applies (or, for null fields, clears) the admin colour overrides as CSS
 * variables on `el`. Clearing a variable falls back to the dark-blue defaults
 * in globals.css. Pure — the settings page reuses it for a live preview.
 */
export function applyAdminTheme(
  el: HTMLElement,
  t: Partial<AdminThemeFields> | null | undefined
) {
  const sidebar = t?.admin_sidebar_color ?? null;
  const sidebarText = t?.admin_sidebar_text_color ?? null;
  const primary = t?.admin_primary_color ?? null;
  const accent = t?.admin_accent_color ?? null;
  const corner = t?.admin_corner_style ?? null;

  setVar(el, "--sidebar", sidebar);
  setVar(el, "--sidebar-accent", sidebar ? `color-mix(in srgb, ${sidebar} 82%, white)` : null);
  setVar(el, "--sidebar-border", sidebar ? `color-mix(in srgb, ${sidebar} 76%, white)` : null);

  setVar(el, "--sidebar-foreground", sidebarText);
  setVar(el, "--sidebar-accent-foreground", sidebarText);

  setVar(el, "--primary", primary);
  setVar(el, "--navy", primary);
  setVar(el, "--navy-light", primary ? `color-mix(in srgb, ${primary} 80%, white)` : null);
  setVar(el, "--navy-dark", primary ? `color-mix(in srgb, ${primary} 82%, black)` : null);

  setVar(el, "--gold", accent);
  setVar(el, "--gold-light", accent ? `color-mix(in srgb, ${accent} 65%, white)` : null);

  setVar(el, "--radius", corner ? CORNER_RADIUS[corner] : null);
}

/** Reads the saved theme and keeps the admin panel's CSS variables in sync. */
export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const { data } = useThemeQuery();

  useEffect(() => {
    applyAdminTheme(document.documentElement, data);
  }, [data]);

  return <>{children}</>;
}
