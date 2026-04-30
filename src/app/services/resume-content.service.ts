import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export type ResumeEntry = {
  title: string;
  subtitle: string;
  bullets: string[];
};

export type ResumeSkillColumn = {
  heading: string;
  items: string[];
};

export type ResumeSection = {
  key: string;
  title: string;
  entries: ResumeEntry[];
  columns: ResumeSkillColumn[];
};

export type ResumeContent = {
  pdfUrl: string;
  workExperience: ResumeEntry[];
  education: ResumeEntry[];
  certifications: ResumeEntry[];
  skills: ResumeSkillColumn[];
  sections?: ResumeSection[];
};

const defaultResumeContent: ResumeContent = {
  pdfUrl: '',
  workExperience: [],
  education: [],
  certifications: [],
  skills: [],
  sections: [],
};

@Injectable({ providedIn: 'root' })
export class ResumeContentService {
  private readonly apiUrl = 'http://127.0.0.1:5050/api/resume-content';
  private readonly contentSubject = new BehaviorSubject<ResumeContent>(
    defaultResumeContent
  );
  readonly content$ = this.contentSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  load(): Observable<ResumeContent> {
    return this.http.get<ResumeContent>(this.apiUrl).pipe(
      tap((data) => {
        this.contentSubject.next(data);
      })
    );
  }

  save(content: ResumeContent): Observable<ResumeContent> {
    return this.http.put<ResumeContent>(this.apiUrl, content).pipe(
      tap((data) => {
        this.contentSubject.next(data);
      })
    );
  }

  saveWithPdf(content: ResumeContent, pdfFile: File): Observable<ResumeContent> {
    const formData = new FormData();
    formData.append('workExperience', JSON.stringify(content.workExperience || []));
    formData.append('education', JSON.stringify(content.education || []));
    formData.append('certifications', JSON.stringify(content.certifications || []));
    formData.append('skills', JSON.stringify(content.skills || []));
    formData.append('resumePdf', pdfFile);

    return this.http.put<ResumeContent>(this.apiUrl, formData).pipe(
      tap((data) => {
        this.contentSubject.next(data);
      })
    );
  }
}
