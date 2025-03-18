// 🚨 Bad Component Example
import React, { useEffect } from "react";

export default function BadComponent() {
  useEffect(() => {
    console.log("This runs on every render"); // Performance issue
  });

  return (
    <div>
      <h1>Title</h1>
      <h1>Duplicate Title</h1> {/* SEO issue: duplicate H1 */}
      <button onClick={() => console.log("Clicked!")}>Click Me</button>
    </div>
  );
}
