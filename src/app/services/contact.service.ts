import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContactFormPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly apiUrl = 'http://127.0.0.1:5050/api/contact-messages';

  constructor(private readonly http: HttpClient) {}

  loadMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(this.apiUrl);
  }

  sendMessage(payload: ContactFormPayload): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(this.apiUrl, payload);
  }

  updateMessage(id: string, updates: Partial<Pick<ContactMessage, 'isRead' | 'isDeleted'>>): Observable<ContactMessage> {
    return this.http.patch<ContactMessage>(`${this.apiUrl}/${id}`, updates);
  }

  clearAllMessages(): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/clear-all`, {});
  }
}
