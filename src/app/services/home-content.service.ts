import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export type HomeContent = {
  fullName: string;
  aboutTitle: string;
  bio: string;
  profileImageUrl: string;
  featuredTitle: string;
  featuredDescription: string;
};

const defaultHomeContent: HomeContent = {
  fullName: '',
  aboutTitle: '',
  bio: '',
  profileImageUrl: '',
  featuredTitle: '',
  featuredDescription: '',
};

@Injectable({ providedIn: 'root' })
export class HomeContentService {
  private readonly apiUrl = 'http://127.0.0.1:5050/api/home-content';
  private readonly contentSubject = new BehaviorSubject<HomeContent>(defaultHomeContent);
  readonly content$ = this.contentSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  load(): Observable<HomeContent> {
    return this.http.get<HomeContent>(this.apiUrl).pipe(
      tap((data) => {
        this.contentSubject.next(data);
      })
    );
  }

  save(content: HomeContent): Observable<HomeContent> {
    const formData = new FormData();
    formData.append('fullName', content.fullName);
    formData.append('aboutTitle', content.aboutTitle);
    formData.append('bio', content.bio);
    formData.append('featuredTitle', content.featuredTitle);
    formData.append('featuredDescription', content.featuredDescription);

    return this.http.put<HomeContent>(this.apiUrl, formData).pipe(
      tap((data) => {
        this.contentSubject.next(data);
      })
    );
  }

  saveWithImage(content: HomeContent, imageFile: File): Observable<HomeContent> {
    const formData = new FormData();
    formData.append('fullName', content.fullName);
    formData.append('aboutTitle', content.aboutTitle);
    formData.append('bio', content.bio);
    formData.append('featuredTitle', content.featuredTitle);
    formData.append('featuredDescription', content.featuredDescription);
    formData.append('profileImage', imageFile);

    return this.http.put<HomeContent>(this.apiUrl, formData).pipe(
      tap((data) => {
        this.contentSubject.next(data);
      })
    );
  }
}
