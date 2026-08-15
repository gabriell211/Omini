"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import { Logo } from "./logo";

type Onboarding = { readonly companyName: string; readonly personName: string; readonly modules: readonly string[] };
const checkoutUrl = process.env.NEXT_PUBLIC_BILLING_CHECKOUT_URL;

export function PaymentCheckout() {
  const router = useRouter();
  const onboardingValue = useSyncExternalStore(
    (notify) => { window.addEventListener("storage", notify); return () => window.removeEventListener("storage", notify); },
    () => sessionStorage.getItem("omni-onboarding"),
    () => undefined
  );
  const onboarding = useMemo<Onboarding | null | undefined>(() => {
    if (onboardingValue === undefined || onboardingValue === null) return onboardingValue;
    return JSON.parse(onboardingValue) as Onboarding;
  }, [onboardingValue]);
  const modulesLabel = useMemo(() => onboarding?.modules.length === 1 ? "1 sistema selecionado" : `${onboarding?.modules.length ?? 0} sistemas selecionados`, [onboarding]);

  useEffect(() => {
    if (onboarding === null) router.replace("/cadastro");
  }, [onboarding, router]);

  if (!onboarding) return <main className="access-loading" aria-label="Carregando cadastro"><i /></main>;

  return <main className="payment"><header><Link href="/landing"><Logo /></Link><span>Checkout seguro</span></header><section className="payment-card"><div className="payment-summary"><p>SEU PLANO</p><h1>Omni mensal</h1><span>{onboarding.companyName} · {modulesLabel}</span><div><strong>R$ 49<span>,90</span></strong><small>por mês</small></div><ul><li><Icon name="plus" size={15} /> Acesso aos sistemas selecionados</li><li><Icon name="plus" size={15} /> Atualizações e segurança contínuas</li><li><Icon name="plus" size={15} /> Liberação automática após confirmação</li></ul></div><div className="payment-action"><span className="payment-lock">⌁</span><h2>Finalize sua assinatura.</h2><p>Após a confirmação do pagamento, seus sistemas serão liberados automaticamente.</p>{checkoutUrl ? <a className="payment-button" href={checkoutUrl}>Pagar R$ 49,90 <Icon name="arrow-right" size={18} /></a> : <div className="payment-awaiting"><strong>Checkout em configuração</strong><span>Configure a URL segura do provedor de pagamento para receber cobranças.</span></div>}<small><Icon name="bell" size={13} /> Você receberá a confirmação assim que o pagamento for aprovado.</small></div></section></main>;
}
