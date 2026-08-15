"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export function SubscriptionGate({ children }: { readonly children: ReactNode }) {
  const router = useRouter();
  const status = useSyncExternalStore(
    (notify) => { window.addEventListener("storage", notify); return () => window.removeEventListener("storage", notify); },
    () => sessionStorage.getItem("omni-subscription-status"),
    () => undefined
  );

  useEffect(() => {
    if (status !== undefined && status !== "active") router.replace("/pagamento");
  }, [router, status]);

  if (status !== "active") return <main className="access-loading" aria-label="Verificando assinatura"><i /></main>;
  return children;
}
