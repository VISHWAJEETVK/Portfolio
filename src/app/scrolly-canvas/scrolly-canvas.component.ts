import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scrolly-canvas',
  standalone: true,
  templateUrl: './scrolly-canvas.component.html',
  styleUrls: ['./scrolly-canvas.component.css']
})
export class ScrollyCanvasComponent implements AfterViewInit {
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLDivElement>;

  public context!: CanvasRenderingContext2D | null;
  public totalFrames = 75;
  public images: HTMLImageElement[] = [];
  public currentFrame = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const canvas = this.canvasRef.nativeElement;
      this.context = canvas.getContext('2d');
      
      this.resizeCanvas();
      this.preloadImages();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.resizeCanvas();
    }
  }

  resizeCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.renderFrame(this.currentFrame);
  }

  preloadImages() {
    for (let i = 0; i < this.totalFrames; i++) {
        const img = new Image();
        const frameIndex = i.toString().padStart(2, '0');
        img.src = `assets/dashboard/frame_${frameIndex}_delay-0.066s.webp`;
        this.images.push(img);
    }

    if (this.images.length > 0) {
      this.images[0].onload = () => {
        this.renderFrame(0);
      };
    }
  }

  renderFrame(index: number) {
    if (!this.context || !this.images[index] || !this.images[index].complete) return;
    
    const canvas = this.canvasRef.nativeElement;
    const img = this.images[index];
    
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    
    // Identify if it's mobile view (< 768px wide)
    const isMobile = window.innerWidth < 768;
    
    // ADJUST THIS VALUE (0.0 to 1.0) based on where the person is in the original video:
    // 0.5 = Dead center, 0.25 = Left side, 0.75 = Right side.
    // Assuming the person is on the right side of your original frame. Shift to 0.25 if left side.
    const mobileFocalX = 0.75; 
    const focalX = isMobile ? mobileFocalX : 0.5;
    const focalY = 0.5; // Keep vertical center

    // Align the image's focal point to the center of the canvas
    let x = (canvas.width / 2) - (img.width * focalX) * scale;
    let y = (canvas.height / 2) - (img.height * focalY) * scale;

    // Clamp the x and y coordinates so we don't accidentally reveal the canvas background
    x = Math.min(0, Math.max(canvas.width - img.width * scale, x));
    y = Math.min(0, Math.max(canvas.height - img.height * scale, y));

    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.context.drawImage(img, x, y, img.width * scale, img.height * scale);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (!isPlatformBrowser(this.platformId) || !this.wrapper) return;
    
    const rect = this.wrapper.nativeElement.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;
    
    // Calculate fraction of standard scroll logic
    // We want 0 at the very top of wrapper, 1 at the very bottom
    let scrollFraction = -rect.top / scrollableDistance;
    scrollFraction = Math.max(0, Math.min(1, scrollFraction));

    const frameIndex = Math.min(
      this.totalFrames - 1,
      Math.floor(scrollFraction * this.totalFrames)
    );

    if (frameIndex !== this.currentFrame) {
      this.currentFrame = frameIndex;
      requestAnimationFrame(() => this.renderFrame(frameIndex));
    }
  }
}
