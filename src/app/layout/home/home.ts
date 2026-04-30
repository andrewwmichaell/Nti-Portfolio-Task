import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HomeContent, HomeContentService } from '../../services/home-content.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  isLoading = true;
  loadError = '';
  private readonly destroy$ = new Subject<void>();
  content: HomeContent = {
    fullName: '',
    aboutTitle: '',
    bio: '',
    profileImageUrl: '',
    featuredTitle: '',
    featuredDescription: '',
  };

  constructor(
    private readonly homeContentService: HomeContentService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.homeContentService.content$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.content = data;
        this.cdr.detectChanges();
      },
    });

    this.homeContentService.load().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.content = data;
        this.isLoading = false;
        this.loadError = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Could not load home content from backend.';
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
