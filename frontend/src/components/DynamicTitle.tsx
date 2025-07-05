"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PAGE_TITLES } from "@/components/pageTitles";

function resolveTitle(pathname: string): string {
  if (pathname === "/") {
    return PAGE_TITLES["/"];
  }

  // 明示的に対応：/employee/[id]
  if (/^\/employee\/[^/]+$/.test(pathname)) {
    return PAGE_TITLES["/employee/[id]"];
  }

  // fallback
  return "タレントマネジメントシステム";
}

export function DynamicTitle() {
  const pathname = usePathname();
  const title = resolveTitle(pathname);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
