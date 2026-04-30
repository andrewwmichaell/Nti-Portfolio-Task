import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Observer } from 'rxjs';
import { ProjectCard } from './project-card/project-card';

type Project = {
  _id: string;
  title: string;
  description: string;
  imageUrls?: string[];
  techTags?: string[];
  githubUrl?: string;
};

@Component({
  selector: 'app-portfolio',
  imports: [ProjectCard, NgClass],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Portfolio implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const projectsObserver: Observer<Project[]> = {
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Could not load projects from backend.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {},
    };

    this.http
      .get<Project[]>('http://127.0.0.1:5050/api/projects')
      .subscribe(projectsObserver);
  }

  getImages(project: Project): string[] {
    if (project.imageUrls && project.imageUrls.length > 0) {
      return project.imageUrls;
    }
    return ['/images/project1.jpg'];
  }

  getTagClass(tag: string): string {
    const normalized = tag.toLowerCase().replace('#', 'sharp').replace(/\./g, '').replace(/\s+/g, '');
    return normalized;
  }
}
