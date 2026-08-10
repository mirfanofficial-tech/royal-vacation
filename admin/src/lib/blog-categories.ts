"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  blogCategories as seedCategories,
  type AdminBlogCategory,
} from "@/lib/mock-data";

const STORAGE_KEY = "rv_admin_blog_categories";

function loadCategories(): AdminBlogCategory[] {
  if (typeof window === "undefined") return seedCategories;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdminBlogCategory[];
  } catch {
    // ignore corrupt storage
  }
  return seedCategories;
}

export function useBlogCategories() {
  const [categories, setCategories] =
    useState<AdminBlogCategory[]>(seedCategories);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setCategories(loadCategories());
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch {
      // ignore quota errors
    }
  }, [categories]);

  const addCategory = useCallback(
    (category: Omit<AdminBlogCategory, "id">) => {
      const id = `cat_${Date.now().toString(36)}`;
      setCategories((prev) => [...prev, { ...category, id }]);
    },
    []
  );

  const updateCategory = useCallback(
    (id: string, patch: Partial<AdminBlogCategory>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    []
  );

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { categories, addCategory, updateCategory, deleteCategory };
}
