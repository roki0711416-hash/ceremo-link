"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

const links = [
  { href: "/freelancer/map", label: "火葬場マップ" },
  { href: "/freelancer/availability", label: "対応可能日時" },
  { href: "/freelancer/offers", label: "届いた依頼" },
];

export function FreelancerMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="メニューを開く"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="tap-target inline-flex items-center justify-center rounded-lg p-2 text-freelancer hover:bg-freelancer-soft"
      >
        <Menu className="size-6" />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-surface py-2 shadow-lg"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-base text-foreground hover:bg-freelancer-soft"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
