"use client";

import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname && ref.current) {
      ref.current.classList.remove("route-fade");
      void ref.current.offsetWidth; // force reflow
      ref.current.classList.add("route-fade");
      prevPathname.current = pathname;
    }
  }, [pathname]);

  if (pathname.startsWith("/present/")) {
    return <>{children}</>;
  }

  return (
    <div ref={ref} className="route-fade" style={{ minHeight: "100%" }}>
      {children}
    </div>
  );
}
