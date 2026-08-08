export interface CreatePriceEstimateRequest {
  details: string;
  fullName: string;
  email: string;
  mobileNo: string;
  country: string;
  pages: number;
  academicLevel: string;
  packageName: string;
  pricePerPage: number;
  estimatedTotal: number;
  currency: string;
}

export interface PriceEstimateRequest extends CreatePriceEstimateRequest {
  id: string;
  createdDate: string;
}
