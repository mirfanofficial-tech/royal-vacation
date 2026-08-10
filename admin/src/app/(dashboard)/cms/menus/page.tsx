"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  LayoutList,
  Link2,
  List,
  Plus,
  Trash2,
} from "lucide-react";

import {
  mockCmsMenus,
  type CmsMenu,
  type CmsMenuItem,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface MenuCardProps {
  menu: CmsMenu;
  onUpdate: (items: CmsMenuItem[]) => void;
}

function MenuCard({ menu, onUpdate }: MenuCardProps) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  function moveItem(itemId: string, direction: -1 | 1) {
    const index = menu.items.findIndex((item) => item.id === itemId);
    const target = index + direction;
    if (target < 0 || target >= menu.items.length) return;
    const items = [...menu.items];
    [items[index], items[target]] = [items[target], items[index]];
    onUpdate(items);
  }

  function removeItem(itemId: string) {
    onUpdate(menu.items.filter((item) => item.id !== itemId));
  }

  function addItem() {
    if (!label.trim()) return;
    onUpdate([
      ...menu.items,
      {
        id: `item_${Date.now().toString(36)}`,
        label: label.trim(),
        url: url.trim() || "#",
      },
    ]);
    setLabel("");
    setUrl("");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <LayoutList className="size-4 text-muted-foreground" />
            {menu.name}
          </CardTitle>
          <CardDescription>{menu.description}</CardDescription>
        </div>
        <Badge variant="secondary">{menu.location}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-hidden rounded-lg border border-border">
          {menu.items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2 last:border-b-0"
            >
              <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-medium text-navy">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <p className="flex items-center gap-1 truncate font-mono text-xs text-muted-foreground">
                  <Link2 className="size-3" />
                  {item.url}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveItem(item.id, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(item.id, 1)}
                  disabled={index === menu.items.length - 1}
                  aria-label="Move down"
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
          {menu.items.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No items in this menu yet.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem();
            }}
            placeholder="Item label"
            className="w-full sm:w-44"
          />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem();
            }}
            placeholder="/about"
            className="w-full flex-1 font-mono text-sm sm:min-w-40"
          />
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus data-icon="inline-start" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CmsMenusPage() {
  const [menus, setMenus] = useState<CmsMenu[]>(mockCmsMenus);

  function updateMenuItems(menuId: string, items: CmsMenuItem[]) {
    setMenus((prev) =>
      prev.map((menu) => (menu.id === menuId ? { ...menu, items } : menu))
    );
  }

  const totalItems = menus.reduce((sum, menu) => sum + menu.items.length, 0);
  const locations = new Set(menus.map((menu) => menu.location)).size;

  const stats = [
    { label: "Menus", value: menus.length, icon: List },
    { label: "Menu items", value: totalItems, icon: LayoutList },
    { label: "Locations", value: locations, icon: Link2 },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Menus</h1>
        <p className="text-sm text-muted-foreground">
          Manage the navigation menus shown across the customer site.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {menus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            onUpdate={(items) => updateMenuItems(menu.id, items)}
          />
        ))}
      </div>
    </div>
  );
}
