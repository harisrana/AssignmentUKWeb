export interface CreatePriceEstimateRequest {
  details: string;
  fullName: string;
  email: string;
  mobileNo: string;
  country: string;
  words: number;
  academicLevel: string;
  packageName: string;
  pricePerPage: number;
  estimatedTotal: number;
  currency: string;
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
}

export interface PriceEstimateRequest extends CreatePriceEstimateRequest {
  id: string;
  discountPercentage: number | null;
  discountRuleName: string | null;
  createdDate: string;
}

export interface PricingRuleQuote {
  discountPercentage: number | null;
  ruleName: string | null;
}
