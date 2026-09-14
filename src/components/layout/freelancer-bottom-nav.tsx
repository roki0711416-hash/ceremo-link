import Link from "next/link";
import { Home, MessageCircle, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

type Tab = "home" | "messages" | "settings";

const tabs: { id: Tab; href: string; label: string; icon: typeof Home }[] = [
  { id: "home", href: "/freelancer", label: "ホーム", icon: Home },
  { id: "messages", href: "/freelancer/messages", label: "メッセージ", icon: MessageCircle },
  { id: "settings", href: "/freelancer/settings", label: "設定", icon: Settings },
];

export function FreelancerBottomNav({ active }: { active: Tab }) {
  return (
    <nav
      aria-label="フリーランスメニュー"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur"
    >
      <div className="page-shell flex items-stretch justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === active;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "tap-target flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-1 text-xs",
                isActive
                  ? "font-semibold text-freelancer"
                  : "text-muted-foreground",
              )}
            >
              <Icon
                className={cn("size-6", isActive && "stroke-[2.5]")}
                aria-hidden
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
