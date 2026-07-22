"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Clock,
  FolderKanban,
  FolderOpen,
  LayoutDashboard,
  Library,
  Network,
  Settings,
  Star,
  Tag as TagIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";
import { useSidebar } from "@/providers/sidebar-provider";
import type { CategoryWithCount, CollectionWithCount, TagWithCount } from "@/lib/types";

const mainNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resources", label: "Ressources", icon: Library },
  { href: "/resources?favorite=true", label: "Favoris", icon: Star },
  { href: "/collections", label: "Collections", icon: FolderKanban },
  { href: "/history", label: "Historique", icon: Clock },
  { href: "/categories", label: "Catégories", icon: FolderOpen },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

async function fetchCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) throw new Error("Impossible de charger les catégories");
  return response.json() as Promise<CategoryWithCount[]>;
}

async function fetchTags() {
  const response = await fetch("/api/tags");
  if (!response.ok) throw new Error("Impossible de charger les tags");
  return response.json() as Promise<TagWithCount[]>;
}

async function fetchCollections() {
  const response = await fetch("/api/collections");
  if (!response.ok) throw new Error("Impossible de charger les collections");
  return response.json() as Promise<CollectionWithCount[]>;
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-2",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!collapsed ? <span className="truncate">{label}</span> : null}
      {!collapsed && isActive ? (
        <span className="ml-auto size-1.5 rounded-full bg-primary" />
      ) : null}
    </Link>
  );
}

type SidebarNavProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("categoryId");
  const activeTag = searchParams.get("tag");
  const [categoriesOpen, setCategoriesOpen] = useState(!collapsed);
  const [collectionsOpen, setCollectionsOpen] = useState(!collapsed);
  const [tagsOpen, setTagsOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  function isNavActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.includes("favorite=true")) {
      return pathname === "/resources" && searchParams.get("favorite") === "true";
    }
    if (href === "/resources") {
      return (
        pathname === "/resources" &&
        !searchParams.get("favorite") &&
        !searchParams.get("categoryId") &&
        !searchParams.get("tag") &&
        !searchParams.get("collectionId")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="space-y-6">
      <div className="space-y-1">
        {!collapsed ? (
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">Menu</p>
        ) : null}
        {mainNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isNavActive(item.href)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {!collapsed ? (
        <>
          <div>
            <button
              type="button"
              onClick={() => setCategoriesOpen((open) => !open)}
              className="mb-2 flex w-full items-center justify-between px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Catégories</span>
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  categoriesOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
            {categoriesOpen ? (
              <div className="space-y-0.5">
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.icon);
                  const isActive =
                    pathname === "/resources" && activeCategoryId === category.id;
                  return (
                    <Link
                      key={category.id}
                      href={`/resources?categoryId=${category.id}`}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon
                          className="size-3.5 shrink-0"
                          style={{ color: isActive ? undefined : (category.color ?? undefined) }}
                        />
                        <span className="truncate">{category.name}</span>
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-[10px] tabular-nums">
                        {category._count.resources}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setCollectionsOpen((open) => !open)}
              className="mb-2 flex w-full items-center justify-between px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Collections</span>
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  collectionsOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
            {collectionsOpen ? (
              <div className="space-y-0.5">
                {collections.map((collection) => {
                  const isActive = pathname === `/collections/${collection.id}`;
                  return (
                    <Link
                      key={collection.id}
                      href={`/collections/${collection.id}`}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <span className="truncate">{collection.name}</span>
                      <Badge variant="secondary" className="shrink-0 text-[10px] tabular-nums">
                        {collection._count.resources}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setTagsOpen((open) => !open)}
              className="mb-2 flex w-full items-center justify-between px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-1.5">
                <TagIcon className="size-3" />
                Tags
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  tagsOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
            {tagsOpen ? (
              <div className="flex flex-wrap gap-1.5 px-2">
                {tags.map((tag) => {
                  const isActive = activeTag === tag.name;
                  return (
                    <Link
                      key={tag.id}
                      href={`/resources?tag=${encodeURIComponent(tag.name)}`}
                      onClick={onNavigate}
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "cursor-pointer text-[11px] transition-colors",
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:border-primary/30 hover:bg-primary/5"
                        )}
                      >
                        {tag.name}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </nav>
  );
}

export function AppSidebar() {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:flex",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className="shrink-0 border-b border-sidebar-border px-4 py-5">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="logo-pulse flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand text-primary-foreground shadow-md shadow-primary/20">
            <Network className="size-4" />
          </div>
          {!collapsed ? (
            <div className="min-w-0 animate-fade-in">
              <p className="truncate font-heading text-sm font-semibold">Ressources Telecom</p>
              <p className="truncate text-xs text-muted-foreground">Hub réseau & télécom</p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav collapsed={collapsed} />
      </div>
    </aside>
  );
}
