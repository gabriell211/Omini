import { DashboardShell } from "../../components/dashboard-shell";
import { SubscriptionGate } from "../../components/subscription-gate";

export default function Home() {
  return <SubscriptionGate><DashboardShell /></SubscriptionGate>;
}
