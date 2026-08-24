import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreatePriceEstimateRequest, PriceEstimateRequest, PricingRuleQuote } from '../models/price-estimate.model';

/** Submits public pricing-page order enquiries. No authentication required. */
@Injectable({ providedIn: 'root' })
export class PriceEstimateService extends BaseApiService {
  submit(payload: CreatePriceEstimateRequest): Observable<PriceEstimateRequest> {
    return this.post<PriceEstimateRequest>(API_ENDPOINTS.priceEstimates.root, payload);
  }

  /** Previews the discount (if any) that would apply, so the calculator can show it before submission. */
  getQuote(packageName: string, academicLevel: string, words: number): Observable<PricingRuleQuote> {
    return this.get<PricingRuleQuote>(API_ENDPOINTS.priceEstimates.quote, { packageName, academicLevel, words });
  }
}
