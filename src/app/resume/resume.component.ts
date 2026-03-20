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
  backendSkills = ['Java (Core + Advanced)', 'Spring Boot', 'Spring Data JPA / Hibernate', 'Microservices Architecture', 'RESTful API Design & Development'];
  frontendSkills = ['Angular (Migration from v10 to v18)', 'TypeScript / JavaScript', 'HTML5 / CSS3', 'Responsive UI Development'];
  dbSkills = ['PostgreSQL', 'Redis (Caching & Optimization)', 'Apache Kafka', 'Debezium (CDC Implementation)'];
  toolSkills = ['Git / GitLab', 'Postman / Swagger', 'IntelliJ IDEA / Eclipse', 'Agile (Scrum)'];
  authSkills = ['JWT', 'OAuth 2.0', 'Single Sign-On (SSO)'];
  additionalSkills = ['Excel Automation', 'Performance Optimization', 'Debugging & Support'];

  experience = [
    {
      role: 'System Engineer Trainee (Intern)',
      company: 'Motherson Technology Services Limited',
      duration: 'Sep 2021 – Dec 2021',
      points: [
        'Supported the development and defect resolution of ongoing enterprise projects.',
        'Actively shadowed senior engineers on architecture decisions.',
        'Assisted in documentation and ensuring software release quality.'
      ]
    },
    {
      role: 'Software Engineer',
      company: 'Motherson Technology Services Limited',
      duration: 'Jan 2022 – Dec 2023',
      points: [
        'Engineered responsive SPAs using Angular, TypeScript, and RxJS.',
        'Developed robust RESTful APIs in Java 17 and Spring Boot 3.2.6.',
        'Integrated PostgreSQL databases via Spring Data JPA efficiently.',
        'Delivered scalable charting and PDF/Excel generation capabilities.'
      ]
    },
    {
      role: 'Senior Software Engineer',
      company: 'Motherson Technology Services Limited',
      duration: 'January 2024 – Present',
      points: [
        'Lead microservices architecture with Kafka, Debezium, and Redis for high-scale environments.',
        'Architected comprehensive Single Sign-On (SSO) strategies via Okta and JWT.',
        'Directed legacy code modernization efforts, migrating monoliths to Spring Boot 3 & Angular 18.',
        'Automated CI/CD pipelines via Jenkins and containerized systems with Docker.'
      ]
    }
  ];
}
