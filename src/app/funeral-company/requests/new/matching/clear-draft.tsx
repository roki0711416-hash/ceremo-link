"use client";

import { useEffect } from "react";

import { clearRequestDraft } from "@/lib/demo/draft-storage";

export function ClearDraftOnMount() {
  useEffect(() => {
    clearRequestDraft();
  }, []);
  return null;
}
