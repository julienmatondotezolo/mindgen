type SubscriptionDetails = {
  MAX_MINDMAPS: number;
  MAX_CREDITS: number;
};

export type ProfileProps = {
  active: boolean;
  banned: boolean;
  email: string;
  userType: string;
  username: string;
  valid: boolean;
  plan: string;
  usedCredits: number;
  subscriptionDetails: SubscriptionDetails;
  roles: string[];
};
