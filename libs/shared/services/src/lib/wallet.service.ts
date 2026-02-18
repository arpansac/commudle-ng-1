import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';
import { IWallet } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  getFundStatus(currency: string): Observable<IWallet> {
    const params = new HttpParams().set('currency', currency);
    return this.http.get<IWallet>(this.baseApiService.getRoute(API_ROUTES.WALLET.FUND_STATUS), { params });
  }
}
