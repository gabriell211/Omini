import { RestaurantOperations } from "../../components/restaurant-operations";
import { SubscriptionGate } from "../../components/subscription-gate";

export default function RestaurantPage() {
  return <SubscriptionGate><RestaurantOperations /></SubscriptionGate>;
}
