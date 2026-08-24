import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreatePricingRuleRequest, PricingRule, UpdatePricingRuleRequest } from '../models/pricing-rule.model';

/** Admin-configurable pricing/discount rules (Configuration → Add Rule). */
@Injectable({ providedIn: 'root' })
export class PricingRuleService extends BaseApiService {
  list(includeInactive = false): Observable<PricingRule[]> {
    return this.get<PricingRule[]>(API_ENDPOINTS.pricingRules.root, { includeInactive });
  }

  create(payload: CreatePricingRuleRequest): Observable<PricingRule> {
    return this.post<PricingRule>(API_ENDPOINTS.pricingRules.root, payload);
  }

  update(id: string, payload: UpdatePricingRuleRequest): Observable<PricingRule> {
    return this.put<PricingRule>(API_ENDPOINTS.pricingRules.byId(id), payload);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.pricingRules.byId(id));
  }
}
