import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Address } from './address';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private baseUrl: string = 'http://localhost:5203/address';

  constructor(private http: HttpClient) {}

  getAddressByProductId(productId: number): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.baseUrl}/product/${productId}`);
  }

  getAddressById(id: number): Observable<Address | null> {
    return this.http.get<Address>(`${this.baseUrl}/${id}`);
  }

  addAddress(address: Address): Observable<Address> {
    return this.http.post<Address>(this.baseUrl, address);
  }

  updateAddress(id: number, address: Address): Observable<Address> {
    return this.http.put<Address>(`${this.baseUrl}/${id}`, address);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
