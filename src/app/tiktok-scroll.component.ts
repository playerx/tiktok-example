// tiktok-scroll.component.ts
import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface VideoItem {
  id: string;
  videoUrl: string;
  color: string;
  username: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
}

@Component({
  selector: 'app-tiktok-scroll',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="tiktok-container"
      #container
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd($event)"
      (wheel)="onWheel($event)"
    >
      <div
        class="video-wrapper"
        *ngFor="let video of videos; let i = index"
        [class.active]="currentIndex === i"
        [style.transform]="getTransform(i)"
        [style.backgroundColor]="video.color"
      >
        <!-- Video element -->
        <!-- <video
          [src]="video.videoUrl"
          [id]="'video-' + video.id"
          (click)="togglePlayPause(i)"
          loop
          muted
          playsinline>
        </video> -->

        <!-- Overlay content -->
        <div class="overlay-content">
          <div class="video-info">
            <div class="username">&#64;{{ video.username }}</div>
            <div class="description">{{ video.description }}</div>
          </div>

          <!-- Right sidebar with actions -->
          <div class="action-bar">
            <div class="action-btn profile">
              <div class="avatar"></div>
              <div class="follow-btn">+</div>
            </div>

            <div class="action-btn like">
              <div class="icon">❤️</div>
              <div class="count">{{ video.likes }}</div>
            </div>

            <div class="action-btn comment">
              <div class="icon">💬</div>
              <div class="count">{{ video.comments }}</div>
            </div>

            <div class="action-btn share">
              <div class="icon">↗️</div>
              <div class="count">{{ video.shares }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div
        class="loading-wrapper"
        *ngIf="isLoading"
        [style.transform]="getLoadingTransform()"
      >
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading more videos...</div>
      </div>
    </div>
  `,
  styles: [
    `
      .tiktok-container {
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        background-color: #000;
        overflow: hidden;
        touch-action: pan-y;
      }

      .video-wrapper {
        position: absolute;
        height: 100%;
        width: 100%;
        transition: transform 0.3s ease-out;
      }

      .video-wrapper.active {
        z-index: 2;
      }

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .overlay-content {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        color: white;
        z-index: 10;
        box-sizing: border-box;
      }

      .video-info {
        flex: 1;
        padding-right: 20px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .username {
        font-weight: bold;
        margin-bottom: 8px;
      }

      .description {
        font-size: 14px;
        margin-bottom: 12px;
      }

      .action-bar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
      }

      .action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      }

      .action-btn .icon {
        font-size: 28px;
        margin-bottom: 4px;
      }

      .action-btn .count {
        font-size: 12px;
      }

      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: #ddd;
        margin-bottom: 4px;
      }

      .follow-btn {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background-color: #ff0050;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        position: absolute;
        margin-top: 40px;
      }

      /* Loading styles */
      .loading-wrapper {
        position: absolute;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        background-color: #000;
        z-index: 1;
      }

      .loading-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top-color: #ff0050;
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 16px;
      }

      .loading-text {
        font-size: 16px;
        font-weight: 500;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class TiktokScrollComponent implements AfterViewInit {
  @Input() videos: VideoItem[] = [];
  @Output() loadMore = new EventEmitter<number>();

  @ViewChild('container') containerRef!: ElementRef;

  currentIndex = 0;
  isDragging = false;
  startY = 0;
  currentY = 0;
  dragOffset = 0;
  containerHeight = 0;

  // Auto-loading related properties
  isLoading = false;
  loadThreshold = 2; // Start loading when user is this many videos away from the end

  // Videos being played/paused
  activeVideos: { [key: number]: boolean } = {};

  constructor() {}

  ngAfterViewInit() {
    this.containerHeight = this.containerRef.nativeElement.clientHeight;
    // Play the first video
    setTimeout(() => {
      this.playVideo(this.currentIndex);
      this.checkLoadMore(); // Initial check in case we need to load more videos
    }, 100);
  }

  getTransform(index: number): string {
    if (this.isDragging) {
      if (index === this.currentIndex) {
        return `translateY(${this.dragOffset}px)`;
      } else if (index === this.currentIndex + 1) {
        return `translateY(${this.containerHeight + this.dragOffset}px)`;
      } else if (index === this.currentIndex - 1) {
        return `translateY(${-this.containerHeight + this.dragOffset}px)`;
      }
    }

    const offset = (index - this.currentIndex) * this.containerHeight;
    return `translateY(${offset}px)`;
  }

  getLoadingTransform(): string {
    return `translateY(${this.containerHeight}px)`;
  }

  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.startY = event.touches[0].clientY;
    this.currentY = this.startY;
    this.dragOffset = 0;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;

    this.currentY = event.touches[0].clientY;
    this.dragOffset = this.currentY - this.startY;

    // Limit the drag distance
    const maxDrag = this.containerHeight * 0.4;
    if (this.dragOffset > maxDrag) this.dragOffset = maxDrag;
    if (this.dragOffset < -maxDrag) this.dragOffset = -maxDrag;
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;

    const threshold = this.containerHeight * 0.2; // 20% of container height

    if (
      this.dragOffset < -threshold &&
      this.currentIndex < this.videos.length - 1
    ) {
      // Swipe up - go to next video
      this.goToNextVideo();
    } else if (this.dragOffset > threshold && this.currentIndex > 0) {
      // Swipe down - go to previous video
      this.goToPreviousVideo();
    }

    this.isDragging = false;
    this.dragOffset = 0;
  }

  // Keyboard navigation
  keyNavigationCooldown = 300; // Time in ms to prevent rapid consecutive key presses
  isKeyNavigating = false;
  keyTimeout: any = null;
  showKeyboardHint = true;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Check if we're in cooldown period
    if (this.isKeyNavigating) {
      return;
    }

    // Handle arrow keys
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.isKeyNavigating = true;

      if (
        event.key === 'ArrowDown' &&
        this.currentIndex < this.videos.length - 1
      ) {
        // Down arrow - go to next video
        this.goToNextVideo();
      } else if (event.key === 'ArrowUp' && this.currentIndex > 0) {
        // Up arrow - go to previous video
        this.goToPreviousVideo();
      }

      // Set cooldown timer
      clearTimeout(this.keyTimeout);
      this.keyTimeout = setTimeout(() => {
        this.isKeyNavigating = false;
      }, this.keyNavigationCooldown);
    }
  }

  // Mouse wheel scroll handling
  isScrolling = false;
  scrollTimeout: any = null;
  scrollThreshold = 50; // Minimum scroll delta to trigger a navigation
  scrollCooldown = 500; // Time in ms to prevent rapid consecutive scrolls

  onWheel(event: WheelEvent) {
    event.preventDefault();

    // Check if we're still in cooldown from a previous scroll
    if (this.isScrolling) {
      return;
    }

    // Determine scroll direction and if it meets the threshold
    const delta = event.deltaY;

    if (Math.abs(delta) >= this.scrollThreshold) {
      this.isScrolling = true;

      if (delta > 0 && this.currentIndex < this.videos.length - 1) {
        // Scroll down - go to next video
        this.goToNextVideo();
      } else if (delta < 0 && this.currentIndex > 0) {
        // Scroll up - go to previous video
        this.goToPreviousVideo();
      }

      // Set cooldown timer to prevent rapid consecutive scrolls
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, this.scrollCooldown);
    }
  }

  // Video navigation
  goToNextVideo() {
    this.pauseVideo(this.currentIndex);
    this.currentIndex++;
    this.playVideo(this.currentIndex);
    this.checkLoadMore();
  }

  goToPreviousVideo() {
    this.pauseVideo(this.currentIndex);
    this.currentIndex--;
    this.playVideo(this.currentIndex);
  }

  togglePlayPause(index: number) {
    const video = document.getElementById(
      `video-${this.videos[index].id}`
    ) as HTMLVideoElement;

    if (video) {
      if (video.paused) {
        video.play();
        this.activeVideos[index] = true;
      } else {
        video.pause();
        this.activeVideos[index] = false;
      }
    }
  }

  playVideo(index: number) {
    const video = document.getElementById(
      `video-${this.videos[index].id}`
    ) as HTMLVideoElement;

    if (video) {
      video.currentTime = 0;
      video.play();
      this.activeVideos[index] = true;
    }
  }

  pauseVideo(index: number) {
    const video = document.getElementById(
      `video-${this.videos[index].id}`
    ) as HTMLVideoElement;

    if (video) {
      video.pause();
      this.activeVideos[index] = false;
    }
  }

  // Auto-loading functionality
  checkLoadMore() {
    // If we're within the threshold of the end, trigger loading more videos
    if (
      this.currentIndex >= this.videos.length - this.loadThreshold &&
      !this.isLoading
    ) {
      this.isLoading = true;
      this.loadMore.emit(this.videos.length);
    }
  }

  // This should be called by the parent component after new videos are loaded
  addVideos(newVideos: VideoItem[]) {
    this.isLoading = false;
    // Avoid duplicates by checking for existing IDs
    const existingIds = new Set(this.videos.map((v) => v.id));
    const uniqueNewVideos = newVideos.filter((v) => !existingIds.has(v.id));

    if (uniqueNewVideos.length > 0) {
      this.videos = [...this.videos, ...uniqueNewVideos];
    }
  }
}
