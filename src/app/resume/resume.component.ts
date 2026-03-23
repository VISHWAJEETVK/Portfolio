import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JourneyCanvasComponent } from './journey.component';
import { AboutAnimationComponent } from './about-animation.component';
import { DeskSceneComponent } from './desk-scene.component';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule, JourneyCanvasComponent, AboutAnimationComponent, DeskSceneComponent],
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css']
})
export class ResumeComponent {
  backendSkills = ['Java (Core + Advanced)', 'Spring Boot', 'Spring Data JPA', 'Microservices Architecture', 'RESTful API Design & Development'];
  frontendSkills = ['Angular (Migration from v10 to v18)', 'TypeScript / JavaScript', 'HTML5 / CSS3', 'Responsive UI Development'];
  dbSkills = ['PostgreSQL', 'Apache Kafka', 'Debezium (CDC Implementation)'];
  toolSkills = ['Git / GitLab', 'Postman / Swagger', 'IntelliJ IDEA / Eclipse', 'Agile (Scrum)'];
  authSkills = ['JWT', 'OAuth 2.0', 'Single Sign-On (SSO)'];
  additionalSkills = ['Excel', 'Performance Optimization', 'Debugging & Support'];

  experience = [
    {
      role: 'Engineer Trainee (Intern)',
      company: 'Motherson Technology Services Limited',
      duration: 'Jan 2022 – Jun 2022',
      points: [
        'Gained hands-on experience in Core Java, including OOP concepts, data structures, and debugging techniques.',
        'Assisted in identifying and resolving bugs, improving application performance and stability.',
        'Participated in code reviews and learned industry best practices for clean and efficient coding.',
        'Worked with Git for version control, collaborating with team members on code integration and updates.'
      ]
    },
    {
      role: 'Engineer',
      company: 'Motherson Technology Services Limited',
      duration: 'Jul 2022 – Sep 2025',
      points: [
        'Developed scalable backend services using Spring Boot, ensuring high performance and maintainability.',
        'Designed and implemented RESTful APIs and microservices architecture for modular and efficient system design.',
        'Integrated Debezium with Kafka and JDBC Sink Connector for real-time database replication across multiple systems.',
        'Implemented secure authentication and authorization using JWT, SSO, and OAuth mechanisms.',
        'Built end-to-end dashboards and operational screens by integrating Angular frontend with backend services.',
        'Migrated legacy applications from Angular 10 to Angular 18 and modernized systems from Struts to Spring Boot and Angular.',
        'Collaborated with cross-functional teams in Agile environments to deliver high-quality features on time.'
      ]
    },
    {
      role: 'Senior Engineer',
      company: 'Motherson Technology Services Limited',
      duration: 'Sep 2025 – Present',
      points: [
        'Providing production support by troubleshooting and resolving critical issues to ensure system stability and uptime.',
        'Collaborating with clients for requirement gathering, analysis, and technical discussions to deliver effective solutions.',
        'Designing and implementing end-to-end project architecture using Spring Boot and Angular.',
        'Leading and mentoring junior developers, ensuring code quality and timely delivery of project milestones.',
        'Driving system optimization and modernization of legacy applications into scalable and maintainable solutions.'
      ]
    }
  ];
}
