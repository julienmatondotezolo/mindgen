type Price = {
  id: string;
  currency: string;
  unitAmount: number;
  active: boolean;
  createdAt: string;
  interval: string;
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  prices: Price[];
  type: string;
  plan: string;
  maxMindmaps: number;
  maxCredits: number;
}
