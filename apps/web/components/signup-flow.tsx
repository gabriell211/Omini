"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon, type IconName } from "./icon";
import { Logo } from "./logo";
import { authClient } from "../lib/auth/client";

type ModuleChoice = { readonly id: string; readonly title: string; readonly description: string; readonly icon: IconName };

const modules: readonly ModuleChoice[] = [
  { id: "restaurant", title: "Restaurante", description: "Comandas, cozinha, delivery e caixa.", icon: "restaurant" },
  { id: "supermarket", title: "Supermercado", description: "PDV, estoque, preços e promoções.", icon: "store" },
  { id: "pharmacy", title: "Farmácia", description: "Lotes, validade e dispensação.", icon: "pill" },
  { id: "legal", title: "Advocacia", description: "Casos, prazos e documentos.", icon: "legal" },
  { id: "veterinary", title: "Veterinária", description: "Agenda, prontuários e vacinação.", icon: "paw" },
  { id: "auto_repair", title: "Oficina", description: "OS, inspeções, peças e boxes.", icon: "wrench" },
  { id: "building_supply", title: "Materiais de construção", description: "Orçamentos, pátio e entregas.", icon: "bricks" },
  { id: "vehicle_dealership", title: "Loja de carros", description: "Estoque, CRM e propostas.", icon: "car" }
];

export function SignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [companyName, setCompanyName] = useState("");
  const [personName, setPersonName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedModules, setSelectedModules] = useState<readonly string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedLabel = useMemo(() => selectedModules.length === 1 ? "1 sistema selecionado" : `${selectedModules.length} sistemas selecionados`, [selectedModules.length]);

  function continueToModules(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyName.trim() || !personName.trim() || !email.trim() || password.length < 8) { setError("Informe nome, empresa, e-mail e uma senha de pelo menos 8 caracteres."); return; }
    setError("");
    setStep(2);
  }

  function toggleModule(moduleId: string) {
    setSelectedModules((current) => current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId]);
    setError("");
  }

  async function finishRegistration() {
    if (selectedModules.length === 0) { setError("Escolha ao menos um sistema para montar sua operação."); return; }
    setIsSubmitting(true);
    setError("");
    try {
      const result = await authClient.signUp.email({ name: personName.trim(), email: email.trim(), password });
      if (result.error) { setError(result.error.message ?? "Não foi possível criar sua conta."); return; }
      sessionStorage.setItem("omni-onboarding", JSON.stringify({ companyName: companyName.trim(), personName: personName.trim(), email: email.trim(), modules: selectedModules }));
      router.push("/pagamento");
    } catch {
      setError("Não foi possível criar sua conta agora. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <main className="signup">
    <aside className="signup-aside"><div><Logo inverse /><div className="signup-aside-copy"><p>COMECE EM MINUTOS</p><h1>Monte a plataforma para a sua operação.</h1><span>Você escolhe os sistemas agora. Pode ativar outros quando a empresa precisar.</span></div></div><div className="signup-price"><span>PLANO OMNI</span><strong>R$ 49,90 <small>/ mês</small></strong><p>Uma assinatura simples para começar.</p></div></aside>
    <section className="signup-content"><header><Link href="/landing">← Voltar</Link><div className="signup-steps" aria-label={`Etapa ${step} de 2`}><span className={step === 1 ? "active" : "complete"}>1</span><i /><span className={step === 2 ? "active" : ""}>2</span></div><small>Etapa {step} de 2</small></header>
      {step === 1 ? <form className="signup-form" onSubmit={continueToModules}><p className="signup-kicker">SUA EMPRESA</p><h2>Vamos começar pelo básico.</h2><span className="signup-subtitle">Estes dados identificam a sua operação e protegem o acesso.</span><label>Seu nome<input autoComplete="name" value={personName} onChange={(event) => setPersonName(event.target.value)} placeholder="Como podemos chamar você?" /></label><label>Nome da empresa<input autoComplete="organization" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Ex.: Casa Verde Restaurante" /></label><label>Seu e-mail<input autoComplete="email" inputMode="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" /></label><label>Crie uma senha<input autoComplete="new-password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="No mínimo 8 caracteres" /></label>{error && <p className="signup-error" role="alert">{error}</p>}<button type="submit" className="signup-next">Escolher sistemas <Icon name="arrow-right" size={18} /></button></form> : <div className="signup-form signup-modules"><p className="signup-kicker">SUA OPERAÇÃO</p><h2>Quais sistemas você precisa?</h2><span className="signup-subtitle">Selecione um ou mais. Cada um permanece isolado e pode ser ajustado depois.</span><div className="signup-module-grid">{modules.map((module) => <button type="button" key={module.id} className={selectedModules.includes(module.id) ? "selected" : ""} aria-pressed={selectedModules.includes(module.id)} onClick={() => toggleModule(module.id)}><span><Icon name={module.icon} size={20} /></span><div><strong>{module.title}</strong><small>{module.description}</small></div><i>{selectedModules.includes(module.id) ? "✓" : "+"}</i></button>)}</div>{error && <p className="signup-error" role="alert">{error}</p>}<footer><button className="signup-back" type="button" disabled={isSubmitting} onClick={() => { setError(""); setStep(1); }}>Voltar</button><span>{selectedLabel}</span><button className="signup-next" type="button" disabled={isSubmitting} onClick={finishRegistration}>{isSubmitting ? "Criando conta…" : "Criar minha operação"} <Icon name="arrow-right" size={18} /></button></footer></div>}
    </section>
  </main>;
}
