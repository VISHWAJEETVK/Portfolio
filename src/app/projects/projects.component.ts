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
      title: 'CAF',
      category: 'Low-code/no-code (LCNC) platform',
      description: 'Designed scalable microservices architecture for Low-code/no-code (LCNC) application which accelerate application development for multiple applications. Developed secure authentication using JWT, SSO, and Okta. Enabled real-time database replication using Kafka and Debezium.',
      image: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Desktop%20computer/3D/desktop_computer_3d.png',
      bgFrom: '#0d4f6b',
      bgTo: '#1a7a8a',
      accentRgb: '0, 139, 139',
      tags: ['Java', 'Spring Boot', 'Kafka', 'JWT', 'Okta']
    },
    {
      title: 'CCS',
      category: 'Legacy Modernization',
      description: 'Migrated legacy application from Struts to Angular + Spring Boot. Developed REST APIs and implemented file upload/download functionality. Built interactive dashboards using Chart.js and enhanced UI experience using ag-Grid.',
      image: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png',
      bgFrom: '#1a3a5c',
      bgTo: '#2d5a8e',
      accentRgb: '44, 95, 141',
      tags: ['Angular', 'Spring Boot', 'Chart.js', 'ag-Grid', 'REST API']
    },
    {
      title: 'CPS',
      category: 'Full-Stack Development',
      description: 'Developed full-stack application using Angular and Spring Boot. Built dynamic dashboards using Chart.js and Highcharts. Implemented Excel and PDF import/export features. Migrated Angular application from version 10 to 18.',
      image: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Laptop/3D/laptop_3d.png',
      bgFrom: '#1a4a2e',
      bgTo: '#2d7a50',
      accentRgb: '44, 95, 45',
      tags: ['Angular 18', 'Highcharts', 'Java 17', 'PostgreSQL', 'PDF/Excel Export','Chart JS','Ag-Grid']
    },
    {
      title: 'FMS',
      category: 'Fund Management System',
      description: 'Built a fund management application for the South Asia region. Engineered with Angular 18, Java 17, and Spring Boot 3.2.6. Developed complex finance calculation engines, interactive dashboards, and custom Excel import/export functionalities.',
      image: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Money%20bag/3D/money_bag_3d.png',
      bgFrom: '#4a3000',
      bgTo: '#7a5200',
      accentRgb: '245, 158, 11',
      tags: ['Angular 18', 'Spring Boot 3', 'Java 17', 'Apache POI Excel','iText PDF']
    }
  ];
}
