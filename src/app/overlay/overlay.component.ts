import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.css']
})
export class OverlayComponent {
  public scrollFraction = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  @HostListener('window:scroll')
  onScroll() {
    if (isPlatformBrowser(this.platformId)) {
      // Find the scrolly-canvas wrapper from DOM to calculate current progress
      const wrapper = document.querySelector('.h-\\[500vh\\]') as HTMLElement;
      if (wrapper) {
            const rect = wrapper.getBoundingClientRect();
            const scrollableDistance = rect.height - window.innerHeight;
            let percent = -rect.top / scrollableDistance;
            this.scrollFraction = Math.max(0, Math.min(1, percent));
      }
    }
  }

  getSection1Style() {
    // Center at 0%
    const opacity = Math.max(0, 1 - (this.scrollFraction / 0.2));
    const transformY = -(this.scrollFraction * 200); 
    return {
      opacity: opacity.toFixed(2),
      transform: `translate(-50%, calc(-50% + ${transformY}px))`
    };
  }

  getSection2Style() {
    // Left aligned at 30%
    let opacity = 0;
    if (this.scrollFraction > 0.15 && this.scrollFraction < 0.5) {
      opacity = 1 - Math.abs(this.scrollFraction - 0.3) * 5; 
      opacity = Math.max(0, opacity);
    }
    const transformY = -((this.scrollFraction - 0.3) * 200); 
    return {
      opacity: opacity.toFixed(2),
      transform: `translateY(${transformY}px)`
    };
  }

  getSection3Style() {
    // Right aligned at 60%
    let opacity = 0;
    if (this.scrollFraction > 0.45 && this.scrollFraction < 0.8) {
      opacity = 1 - Math.abs(this.scrollFraction - 0.6) * 5; 
      opacity = Math.max(0, opacity);
    }
    const transformY = -((this.scrollFraction - 0.6) * 200); 
    return {
      opacity: opacity.toFixed(2),
      transform: `translateY(${transformY}px)`
    };
  }
}
