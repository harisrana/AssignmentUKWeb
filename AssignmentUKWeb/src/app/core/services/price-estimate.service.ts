import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreatePriceEstimateRequest, PriceEstimateRequest } from '../models/price-estimate.model';

/** Submits public pricing-page order enquiries. No authentication required. */
@Injectable({ providedIn: 'root' })
export class PriceEstimateService extends BaseApiService {
  submit(payload: CreatePriceEstimateRequest): Observable<PriceEstimateRequest> {
    return this.post<PriceEstimateRequest>(API_ENDPOINTS.priceEstimates.root, payload);
  }
}
