import { Suspense } from "react";
import HomePage from "./home-page";

export default function Home() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-12 text-center text-muted">A carregar...</div>}>
      <HomePage />
    </Suspense>
  );
}
