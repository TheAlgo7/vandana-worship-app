"use client";

import { usePathname } from "next/navigation";

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/present/")) {
    return <>{children}</>;
  }

  return (
    <div key={pathname} className="route-fade" style={{ minHeight: "100%" }}>
      {children}
    </div>
  );
}
