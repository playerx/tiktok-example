import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TiktokScrollComponent } from './tiktok-scroll.component';

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
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TiktokScrollComponent, HttpClientModule],
  template: `
    <app-tiktok-scroll [videos]="videos" (loadMore)="loadMoreVideos($event)">
    </app-tiktok-scroll>
  `,
})
export class AppComponent {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.example.com/videos';
  private pageSize = 5;

  videos: VideoItem[] = [
    {
      id: '1',
      videoUrl: 'https://example.com/video1.mp4',
      color: 'green',
      username: 'user1',
      description: 'Check out this amazing video! #trending #viral',
      likes: 1204,
      comments: 85,
      shares: 42,
    },
    {
      id: '2',
      videoUrl: 'https://example.com/video2.mp4',
      color: 'blue',
      username: 'user2',
      description: 'This is how I make my favorite recipe 🍕 #food #cooking',
      likes: 3621,
      comments: 128,
      shares: 76,
    },
    {
      id: '3',
      videoUrl: 'https://example.com/video3.mp4',
      color: 'skyblue',
      username: 'user3',
      description: 'Morning routine 🌞 #lifestyle #morning',
      likes: 8902,
      comments: 342,
      shares: 156,
    },
  ];

  // Reference to the TikTok scroll component
  @ViewChild(TiktokScrollComponent) tiktokComponent!: TiktokScrollComponent;

  constructor() {
    // Pre-load some initial videos (in a real app, these would come from an API)
  }

  loadMoreVideos(currentCount: number) {
    console.log(`Loading more videos starting from index ${currentCount}`);

    // In a real app, you'd call your API here with pagination parameters
    // this.http.get<VideoItem[]>(`${this.apiUrl}?offset=${currentCount}&limit=${this.pageSize}`)
    //   .subscribe(newVideos => {
    //     this.tiktokComponent.addVideos(newVideos);
    //   });

    // For demo purposes, we'll simulate an API call with a timeout
    setTimeout(() => {
      const newVideos: VideoItem[] = this.generateMockVideos(
        currentCount,
        this.pageSize
      );
      this.tiktokComponent.addVideos(newVideos);
    }, 1500); // Simulate network delay
  }

  // Helper method to generate mock videos for demo purposes
  private generateMockVideos(startIndex: number, count: number): VideoItem[] {
    const mockVideos: VideoItem[] = [];

    for (let i = 0; i < count; i++) {
      const id = (startIndex + i + 1).toString();
      mockVideos.push({
        id,
        videoUrl: `https://example.com/video${id}.mp4`,
        color: 'orange',
        username: `user${id}`,
        description: `This is auto-loaded video #${id} #tiktok #viral`,
        likes: Math.floor(Math.random() * 10000) + 500,
        comments: Math.floor(Math.random() * 500) + 50,
        shares: Math.floor(Math.random() * 300) + 20,
      });
    }

    return mockVideos;
  }
}
