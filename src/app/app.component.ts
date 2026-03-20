import { Component } from '@angular/core';
import { ScrollyCanvasComponent } from './scrolly-canvas/scrolly-canvas.component';
import { OverlayComponent } from './overlay/overlay.component';
import { ProjectsComponent } from './projects/projects.component';
import { ResumeComponent } from './resume/resume.component';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ScrollyCanvasComponent, OverlayComponent, ResumeComponent, ProjectsComponent, ContactComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'portfolio';
}
