import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  emailCopied = false;
  phoneCopied = false;
  mouseX = 50;
  mouseY = 50;

  constructor(@Inject(PLATFORM_ID) private pid: Object) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    this.mouseY = ((e.clientY - rect.top) / rect.height) * 100;
  }

  copyEmail() {
    if (isPlatformBrowser(this.pid)) {
      navigator.clipboard.writeText('vishwajeetvk17@gmail.com').catch(() => {});
      this.emailCopied = true;
      setTimeout(() => this.emailCopied = false, 2200);
    }
  }

  copyPhone() {
    if (isPlatformBrowser(this.pid)) {
      navigator.clipboard.writeText('+918210147086').catch(() => {});
      this.phoneCopied = true;
      setTimeout(() => this.phoneCopied = false, 2200);
    }
  }
}
