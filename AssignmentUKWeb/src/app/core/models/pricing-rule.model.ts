export interface PricingRule {
  id: string;
  name: string;
  packageName: string | null;
  academicLevel: string | null;
  minWords: number | null;
  discountPercentage: number;
  isActive: boolean;
  createdDate: string;
}

export interface CreatePricingRuleRequest {
  name: string;
  packageName: string | null;
  academicLevel: string | null;
  minWords: number | null;
  discountPercentage: number;
}

export interface UpdatePricingRuleRequest {
  name: string;
  packageName: string | null;
  academicLevel: string | null;
  minWords: number | null;
  discountPercentage: number;
  isActive: boolean;
}
