import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  projects = [
    {
      title: 'Mi Pay',
      category: 'Full-Stack Application',
      duration: 'April 2026 – Present',
      description: 'Developing an enterprise invoice management application using Java, Spring Boot, Angular, and Spring Data JPA, integrating AI-based OCR-extracted invoice data through backend services for tenant details, menus, RBAC permissions, and invoice operations. Implemented multi-level RBAC approval workflows, invoice search/filter/update/export functionality, and interactive ApexCharts dashboards to support efficient invoice processing and data-driven decision-making. ',
      image: '../../assets/images/invoice.png',
      bgFrom: '#1e1b4b',
      bgTo: '#0f766e',
      accentRgb: '16, 185, 129',
      tags: ['Angular 18', 'Spring Boot','Spring Data JPA', 'CAF Framework', 'ApexCharts', 'RBAC', 'REST API']
    },
    {
      title: 'CAF',
      category: 'Low-code/no-code (LCNC) platform',
        duration: 'August 2024 – November 2025',
      description: 'Designed scalable microservices architecture for Low-code/no-code (LCNC) application which accelerate application development for multiple applications. Developed secure authentication using JWT, SSO, and Okta. Enabled real-time database replication using Kafka and Debezium.',
      image: '../../assets/images/desktop_computer_3d.png',
      bgFrom: '#0d4f6b',
      bgTo: '#1a7a8a',
      accentRgb: '0, 139, 139',
      tags: ['Java 17', 'Spring Boot', 'Kafka', 'JWT', 'Okta']
    },
    {
      title: 'CCS',
      category: 'Legacy Modernization',
        duration: 'October 2023 – July 2024',
      description: 'Migrated legacy application from Struts to Angular + Spring Boot. Developed REST APIs and implemented file upload/download functionality. Built interactive dashboards using Chart.js and enhanced UI experience using ag-Grid.',
      image: '../../assets/images/rocket_3d.png',
      bgFrom: '#1a3a5c',
      bgTo: '#2d5a8e',
      accentRgb: '44, 95, 141',
      tags: ['Angular 14', 'Spring Boot', 'Chart.js', 'ag-Grid', 'REST API']
    },
    {
      title: 'CPS',
      category: 'Full-Stack Development',
        duration: 'May 2022 – Present',
      description: 'Developed full-stack application using Angular and Spring Boot. Built dynamic dashboards using Chart.js and Highcharts. Implemented Excel and PDF import/export features. Migrated Angular application from version 10 to 18.',
      image: '../../assets/images/laptop_3d.png',
      bgFrom: '#1a4a2e',
      bgTo: '#2d7a50',
      accentRgb: '44, 95, 45',
      tags: ['Angular 18', 'Highcharts', 'Java 11', 'PostgreSQL', 'PDF/Excel Export', 'Chart JS', 'Ag-Grid']
    },
    {
      title: 'FMS',
      category: 'Fund Management System',
        duration: 'September 2025 – March 2026',
      description: 'Built a fund management application for the South Asia region. Engineered with Angular 18, Java 17, and Spring Boot 3.2.6. Developed complex finance calculation engines, interactive dashboards, and custom Excel import/export functionalities.',
      image: '../../assets/images/money_bag_3d.png',
      bgFrom: '#4a3000',
      bgTo: '#7a5200',
      accentRgb: '245, 158, 11',
      tags: ['Angular 18', 'Spring Boot', 'Java 17', 'Apache POI Excel', 'iText PDF']
    }
  ];
}
