import { Suspense } from "react";
import CompararClient from "./client-page";

export default function CompararPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted">A carregar...</div>}>
      <CompararClient />
    </Suspense>
  );
}
