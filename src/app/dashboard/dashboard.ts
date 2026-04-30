import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observer, Subject, takeUntil } from 'rxjs';
import { HomeContent, HomeContentService } from '../services/home-content.service';
import {
  ResumeContent,
  ResumeContentService,
  ResumeEntry,
  ResumeSection,
  ResumeSkillColumn,
} from '../services/resume-content.service';
import { ContactMessage, ContactService } from '../services/contact.service';

type Project = {
  _id: string;
  title: string;
  description: string;
  techTags?: string[];
  githubUrl?: string;
  imageUrls?: string[];
};

type ResumeEntryEditor = {
  title: string;
  subtitle: string;
  bulletsText: string;
};

type ResumeSkillColumnEditor = {
  heading: string;
  itemsText: string;
};

type ResumeSectionEditor = {
  key: string;
  title: string;
  entries: ResumeEntryEditor[];
  columns: ResumeSkillColumnEditor[];
};

type ResumeEditor = {
  pdfUrl: string;
  sections: Record<string, ResumeSectionEditor>;
};

type ResumeSectionDefinition = {
  key: string;
  title: string;
  type: 'entries' | 'columns';
};

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, OnDestroy {
  projects: Project[] = [];
  loading = true;
  message = '';
  selectedFiles: File[] = [];
  editingProjectId: string | null = null;
  selectedHomeImage: File | null = null;
  isEditingHome = false;
  isEditingResume = false;
  resumeContent: ResumeContent = {
    pdfUrl: '',
    workExperience: [],
    education: [],
    certifications: [],
    skills: [],
    sections: [],
  };
  resumeEditor: ResumeEditor = { pdfUrl: '', sections: {} };
  resumeSectionDefs: ResumeSectionDefinition[] = [
    { key: 'workExperience', title: 'Work Experience', type: 'entries' },
    { key: 'education', title: 'Education', type: 'entries' },
    { key: 'certifications', title: 'Certifications', type: 'entries' },
    { key: 'skills', title: 'Skills', type: 'columns' },
  ];
  selectedResumePdf: File | null = null;
  private readonly destroy$ = new Subject<void>();
  homeContent: HomeContent = {
    fullName: '',
    aboutTitle: '',
    bio: '',
    profileImageUrl: '',
    featuredTitle: '',
    featuredDescription: '',
  };

  contactMessages: ContactMessage[] = [];
  contactLoading = true;
  contactMessageStatus = '';

  newProject = {
    title: '',
    description: '',
    techTags: '',
    githubUrl: '',
  };

  constructor(
    private readonly http: HttpClient,
    private readonly homeContentService: HomeContentService,
    private readonly resumeContentService: ResumeContentService,
    private readonly contactService: ContactService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadHomeContent();
    this.loadResumeContent();
    this.loadContactMessages();
  }

  loadContactMessages(): void {
    this.contactLoading = true;
    this.contactMessageStatus = '';
    this.contactService
      .loadMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.contactMessages = data;
          this.contactLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.contactMessageStatus = 'Could not load contact messages.';
          this.contactLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  markMessageRead(message: ContactMessage): void {
    this.contactService
      .updateMessage(message._id, { isRead: !message.isRead })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedMessage) => {
          this.contactMessages = this.contactMessages.map((item) =>
            item._id === updatedMessage._id ? updatedMessage : item
          );
          this.contactMessageStatus = 'Message status updated.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.contactMessageStatus = 'Could not update message status.';
          this.cdr.detectChanges();
        },
      });
  }

  clearAllContactMessages(): void {
    this.contactService
      .clearAllMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.contactMessages = [];
          this.contactMessageStatus = 'All contact messages marked deleted.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.contactMessageStatus = 'Could not clear contact messages.';
          this.cdr.detectChanges();
        },
      });
  }

  loadResumeContent(): void {
    this.resumeContentService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.resumeContent = data;
          this.buildResumeEditor();
          this.cdr.detectChanges();
        },
        error: () => {
          this.message = 'Could not load resume content.';
          this.cdr.detectChanges();
        },
      });
  }

  private buildResumeEditor(): void {
    this.resumeEditor = { pdfUrl: this.resumeContent.pdfUrl || '', sections: {} };
    const sectionMap = new Map<string, ResumeSection>();
    for (const section of this.resumeContent.sections || []) {
      sectionMap.set(section.key, section);
    }

    for (const sectionDef of this.resumeSectionDefs) {
      let sourceSection: ResumeSection | undefined;
      if (sectionDef.type === 'entries') {
        const legacySection = sectionMap.get(sectionDef.key);
        sourceSection = legacySection ?? {
          key: sectionDef.key,
          title: sectionDef.title,
          entries: [],
          columns: [],
        };
      }

      const sectionEditor: ResumeSectionEditor = {
        key: sectionDef.key,
        title: sectionDef.title,
        entries:
          sectionDef.type === 'entries'
            ? (this.resumeContent[sectionDef.key as 'workExperience' | 'education' | 'certifications'] as ResumeEntry[])
                ?.length
              ? (this.resumeContent[sectionDef.key as 'workExperience' | 'education' | 'certifications'] as ResumeEntry[]).map(
                  (entry) => ({
                    title: entry.title,
                    subtitle: entry.subtitle,
                    bulletsText: (entry.bullets || []).join('\n'),
                  })
                )
              : sourceSection?.entries?.length
              ? sourceSection.entries.map((entry) => ({
                  title: entry.title,
                  subtitle: entry.subtitle,
                  bulletsText: (entry.bullets || []).join('\n'),
                }))
              : [{ title: '', subtitle: '', bulletsText: '' }]
            : [],
        columns:
          sectionDef.type === 'columns'
            ? this.resumeContent.skills?.length
              ? this.resumeContent.skills.map((column) => ({
                  heading: column.heading,
                  itemsText: (column.items || []).join('\n'),
                }))
              : [{ heading: '', itemsText: '' }]
            : [],
      };
      this.resumeEditor.sections[sectionDef.key] = sectionEditor;
    }
  }

  getSectionEditor(key: string): ResumeSectionEditor {
    const section = this.resumeEditor.sections[key];
    if (!section) {
      const def = this.resumeSectionDefs.find((item) => item.key === key);
      this.resumeEditor.sections[key] = {
        key,
        title: def?.title ?? key,
        entries: [{ title: '', subtitle: '', bulletsText: '' }],
        columns: [{ heading: '', itemsText: '' }],
      };
    }
    return this.resumeEditor.sections[key];
  }

  addResumeEntry(sectionKey: string): void {
    this.getSectionEditor(sectionKey).entries.push({ title: '', subtitle: '', bulletsText: '' });
    this.cdr.detectChanges();
  }

  removeResumeEntry(sectionKey: string, index: number): void {
    const section = this.getSectionEditor(sectionKey);
    if (section.entries.length > 1) {
      section.entries.splice(index, 1);
    } else {
      section.entries[0] = { title: '', subtitle: '', bulletsText: '' };
    }
    this.cdr.detectChanges();
  }

  addResumeSkillColumn(): void {
    this.getSectionEditor('skills').columns.push({ heading: '', itemsText: '' });
    this.cdr.detectChanges();
  }

  removeResumeSkillColumn(index: number): void {
    const section = this.getSectionEditor('skills');
    if (section.columns.length > 1) {
      section.columns.splice(index, 1);
    } else {
      section.columns[0] = { heading: '', itemsText: '' };
    }
    this.cdr.detectChanges();
  }

  private updateResumeContentFromEditor(): void {
    this.resumeContent.pdfUrl = this.resumeEditor.pdfUrl || '';
    this.resumeContent.workExperience = this.getSectionEditor('workExperience').entries
      .map((entry) => ({
        title: entry.title.trim(),
        subtitle: entry.subtitle.trim(),
        bullets: entry.bulletsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      }))
      .filter(
        (entry) => entry.title !== '' || entry.subtitle !== '' || entry.bullets.length > 0
      );

    this.resumeContent.education = this.getSectionEditor('education').entries
      .map((entry) => ({
        title: entry.title.trim(),
        subtitle: entry.subtitle.trim(),
        bullets: entry.bulletsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      }))
      .filter(
        (entry) => entry.title !== '' || entry.subtitle !== '' || entry.bullets.length > 0
      );

    this.resumeContent.certifications = this.getSectionEditor('certifications').entries
      .map((entry) => ({
        title: entry.title.trim(),
        subtitle: entry.subtitle.trim(),
        bullets: entry.bulletsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      }))
      .filter(
        (entry) => entry.title !== '' || entry.subtitle !== '' || entry.bullets.length > 0
      );

    this.resumeContent.skills = this.getSectionEditor('skills').columns
      .map((column) => ({
        heading: column.heading.trim(),
        items: column.itemsText
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      }))
      .filter((column) => column.heading !== '' || column.items.length > 0);

    this.resumeContent.sections = [];
  }

  saveResumeContent(): void {
    this.updateResumeContentFromEditor();

    const request$ = this.selectedResumePdf
      ? this.resumeContentService.saveWithPdf(this.resumeContent, this.selectedResumePdf)
      : this.resumeContentService.save(this.resumeContent);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.resumeContent = data;
        this.buildResumeEditor();
        this.selectedResumePdf = null;
        this.isEditingResume = false;
        this.message = 'Resume content updated.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Could not update resume content.';
        this.cdr.detectChanges();
      },
    });
  }

  toggleEditResume(): void {
    this.isEditingResume = !this.isEditingResume;
    if (this.isEditingResume) {
      this.buildResumeEditor();
    } else {
      this.selectedResumePdf = null;
    }
    this.cdr.detectChanges();
  }

  onResumePdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = (input.files || [])[0] || null;
    this.selectedResumePdf = file;
    this.cdr.detectChanges();
  }

  loadHomeContent(): void {
    this.homeContentService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.homeContent = data;
          this.cdr.detectChanges();
        },
        error: () => {
          this.message = 'Could not load home content.';
          this.cdr.detectChanges();
        },
      });
  }

  loadProjects(): void {
    this.loading = true;
    const projectsObserver: Observer<Project[]> = {
      next: (data) => {
        this.projects = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Could not load projects.';
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {},
    };

    this.http
      .get<Project[]>('http://127.0.0.1:5050/api/projects')
      .pipe(takeUntil(this.destroy$))
      .subscribe(projectsObserver);
  }

  addProject(): void {
    const title = this.newProject.title.trim();
    const description = this.newProject.description.trim();
    if (!title || !description) {
      this.message = 'Title and description are required.';
      return;
    }

    if (this.editingProjectId) {
      const payload = {
        title,
        description,
        techTags: this.newProject.techTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        githubUrl: this.newProject.githubUrl.trim(),
      };

      this.http
        .patch(`http://127.0.0.1:5050/api/projects/${this.editingProjectId}`, payload)
        .subscribe({
          next: () => {
            this.message = 'Project updated.';
            this.resetProjectForm();
            this.loadProjects();
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.message =
              error?.error?.message ||
              (error?.error?.errors ? JSON.stringify(error.error.errors) : '') ||
              'Could not update project.';
            this.cdr.detectChanges();
          },
        });
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.message = 'Please upload at least 1 photo.';
      return;
    }

    if (this.selectedFiles.length > 10) {
      this.message = 'You can upload maximum 10 photos.';
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('techTags', this.newProject.techTags);
    formData.append('githubUrl', this.newProject.githubUrl.trim());

    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.http.post('http://127.0.0.1:5050/api/projects', formData).subscribe({
      next: () => {
        this.message = 'Project added.';
        this.resetProjectForm();
        this.loadProjects();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.message =
          error?.error?.message ||
          (error?.error?.errors ? JSON.stringify(error.error.errors) : '') ||
          'Could not add project.';
        this.cdr.detectChanges();
      },
    });
  }

  softDeleteProject(id: string): void {
    this.http.delete(`http://127.0.0.1:5050/api/projects/${id}`).subscribe({
      next: () => {
        this.message = 'Project removed (soft delete).';
        this.loadProjects();
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Could not remove project.';
        this.cdr.detectChanges();
      },
    });
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.selectedFiles = files.slice(0, 10);
    if (files.length > 10) {
      this.message = 'Only first 10 photos were selected.';
    }
    this.cdr.detectChanges();
  }

  startEditProject(project: Project): void {
    this.editingProjectId = project._id;
    this.newProject = {
      title: project.title || '',
      description: project.description || '',
      techTags: (project.techTags || []).join(', '),
      githubUrl: project.githubUrl || '',
    };
    this.selectedFiles = [];
    this.message = 'Editing project. Press Add Project to save changes.';
    this.cdr.detectChanges();
  }

  cancelProjectEdit(): void {
    this.resetProjectForm();
    this.message = 'Project edit cancelled.';
    this.cdr.detectChanges();
  }

  private resetProjectForm(): void {
    this.editingProjectId = null;
    this.newProject = { title: '', description: '', techTags: '', githubUrl: '' };
    this.selectedFiles = [];
  }

  saveHomeContent(): void {
    if (!this.isEditingHome) {
      this.isEditingHome = true;
      this.message = 'Edit mode enabled. Make your changes, then click Save Home Content again.';
      this.cdr.detectChanges();
      return;
    }

    const request$ = this.selectedHomeImage
      ? this.homeContentService.saveWithImage(this.homeContent, this.selectedHomeImage)
      : this.homeContentService.save(this.homeContent);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.homeContentService.load().subscribe({
          next: (updated) => {
            this.homeContent = updated;
            this.selectedHomeImage = null;
            this.isEditingHome = false;
            this.message = 'Home content updated.';
            this.cdr.detectChanges();
          },
        });
      },
      error: (error) => {
        this.message =
          error?.error?.message ||
          (error?.error?.errors ? JSON.stringify(error.error.errors) : '') ||
          'Could not update home content.';
        this.cdr.detectChanges();
      },
    });
  }

  toggleEditHome(): void {
    this.isEditingHome = !this.isEditingHome;
    if (!this.isEditingHome) {
        this.selectedHomeImage = null;
    }
    this.cdr.detectChanges();
  }

  onHomeImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = (input.files || [])[0] || null;
    this.selectedHomeImage = file;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
