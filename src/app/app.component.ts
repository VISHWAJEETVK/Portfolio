import { Component, Inject, PLATFORM_ID, OnInit, AfterViewInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ScrollyCanvasComponent } from './scrolly-canvas/scrolly-canvas.component';
import { OverlayComponent } from './overlay/overlay.component';
import { ProjectsComponent } from './projects/projects.component';
import { ResumeComponent } from './resume/resume.component';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ScrollyCanvasComponent, OverlayComponent, ResumeComponent, ProjectsComponent, ContactComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'portfolio';
  isDark = false;

  @ViewChild('orb1') orb1!: ElementRef<HTMLDivElement>;
  @ViewChild('orb2') orb2!: ElementRef<HTMLDivElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isDark = localStorage.getItem('theme') === 'dark';
      this.applyTheme();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initCursorAnimation();
    }
  }

  private initCursorAnimation() {
    this.ngZone.runOutsideAngular(() => {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let ringX = mouseX;
      let ringY = mouseY;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      let orb1X = window.innerWidth / 2;
      let orb1Y = window.innerHeight / 2;
      let orb2X = window.innerWidth / 2;
      let orb2Y = window.innerHeight / 2;

      const animate = () => {
        // Fast follower
        orb1X += (mouseX - orb1X) * 0.08;
        orb1Y += (mouseY - orb1Y) * 0.08;
        
        // Slow follower with slight offset
        orb2X += (mouseX - orb2X) * 0.03;
        orb2Y += (mouseY - orb2Y) * 0.03;
        
        if (this.orb1?.nativeElement) {
          this.orb1.nativeElement.style.transform = `translate3d(${orb1X}px, ${orb1Y}px, 0) translate(-50%, -50%)`;
        }
        if (this.orb2?.nativeElement) {
          this.orb2.nativeElement.style.transform = `translate3d(${orb2X}px, ${orb2Y}px, 0) translate(-50%, -50%)`;
        }
        requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    });
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      this.applyTheme();
    }
  }

  private applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
