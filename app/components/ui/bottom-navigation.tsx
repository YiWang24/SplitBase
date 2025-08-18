"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Home, Receipt, Plus, Users, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/create");
  };

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      onClick: undefined,
    },
    {
      href: "/bills",
      icon: Receipt,
      label: "Bills",
      onClick: undefined,
    },
    {
      href: "/create",
      icon: Plus,
      label: "Create",
      onClick: handleCreateClick,
    },
    {
      href: "/nfts",
      icon: Star,
      label: "NFTs",
      onClick: undefined,
    },
    {
      href: "/friends",
      icon: Users,
      label: "Friends",
      onClick: undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border z-50 shadow-lg overflow-x-hidden">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Improved active state detection
            let isActive = false;
            if (item.label === "Home") {
              isActive = pathname === "/" && !searchParams.get("action");
            } else if (item.label === "Bills") {
              isActive = pathname === "/bills";
            } else if (item.label === "Create") {
              isActive = pathname === "/create";
            } else if (item.label === "NFTs") {
              isActive = pathname === "/nfts";
            } else if (item.label === "Friends") {
              isActive = pathname === "/friends";
            }

            if (item.onClick) {
              return (
                <Button
                  key={item.href}
                  onClick={item.onClick}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex flex-col h-auto py-2 px-3 font-mono text-xs tracking-wider transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground transform -translate-y-0.5 shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-accent hover:transform hover:-translate-y-0.5",
                  )}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[8px] font-normal">
                    {item.label.toUpperCase()}
                  </span>
                </Button>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex flex-col h-auto py-2 px-3 font-mono text-xs tracking-wider transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground transform -translate-y-0.5 shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-accent hover:transform hover:-translate-y-0.5",
                  )}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[8px] font-normal">
                    {item.label.toUpperCase()}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
