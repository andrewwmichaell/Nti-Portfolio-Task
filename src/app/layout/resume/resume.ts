import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  ResumeContent,
  ResumeContentService,
  ResumeEntry,
  ResumeSkillColumn,
} from '../../services/resume-content.service';

type ResumeDisplaySection = {
  key: string;
  title: string;
  type: 'entries' | 'columns';
};

@Component({
  selector: 'app-resume',
  imports: [],
  templateUrl: './resume.html',
  styleUrl: './resume.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Resume implements OnInit {
  content: ResumeContent = {
    pdfUrl: '',
    workExperience: [],
    education: [],
    certifications: [],
    skills: [],
  };
  openSectionKey: string | null = null;
  sections: ResumeDisplaySection[] = [
    { key: 'workExperience', title: 'Work Experience', type: 'entries' },
    { key: 'education', title: 'Education', type: 'entries' },
    { key: 'certifications', title: 'Certifications', type: 'entries' },
    { key: 'skills', title: 'Skills', type: 'columns' },
  ];

  constructor(
    private readonly resumeContentService: ResumeContentService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.resumeContentService.load().subscribe({
      next: (data) => {
        this.content = {
          pdfUrl: data.pdfUrl || '',
          workExperience: data.workExperience || [],
          education: data.education || [],
          certifications: data.certifications || [],
          skills: data.skills || [],
        };
        this.cdr.detectChanges();
      },
    });
  }

  toggleSection(sectionKey: string): void {
    this.openSectionKey = this.openSectionKey === sectionKey ? null : sectionKey;
  }

  isOpen(sectionKey: string): boolean {
    return this.openSectionKey === sectionKey;
  }

  getEntries(sectionKey: string): ResumeEntry[] {
    switch (sectionKey) {
      case 'workExperience':
        return this.content.workExperience;
      case 'education':
        return this.content.education;
      case 'certifications':
        return this.content.certifications;
      default:
        return [];
    }
  }

  getSkills(): ResumeSkillColumn[] {
    return this.content.skills;
  }

  downloadResume(): void {
    if (!this.content.pdfUrl) {
      return;
    }

    const fullUrl = this.content.pdfUrl.startsWith('http')
      ? this.content.pdfUrl
      : `http://127.0.0.1:5050${this.content.pdfUrl}`;

    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = 'resume.pdf';
    link.click();
  }
}
