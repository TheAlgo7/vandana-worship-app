"use client";

import { useState, useEffect } from "react";

export default function Greeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  if (!greeting) return null;

  return (
    <p
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        color: "var(--text-secondary)",
        marginBottom: 4,
      }}
    >
      {greeting}
    </p>
  );
}
