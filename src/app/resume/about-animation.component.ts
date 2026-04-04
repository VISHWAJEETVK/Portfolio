import {
  Component, ElementRef, ViewChild, AfterViewInit,
  HostListener, Inject, PLATFORM_ID, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-about-animation',
  standalone: true,
  template: `<div #container class="w-full h-full"></div>`,
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
})
export class AboutAnimationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animId!: number;
  private clock = new THREE.Clock();

  private avatarMesh!: THREE.Mesh;
  
  // Scroll state
  private scrollProgress = 0;
  private scrollTarget = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.init();
      this.animate();
    }
  }

  ngOnDestroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }

  private init() {
    const el = this.container.nativeElement;
    const w = el.clientWidth || 400;
    const h = el.clientHeight || 400;

    this.scene = new THREE.Scene();
    
    // fully transparent — blends with page background
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    el.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 8); // Moved camera slightly back for a full-body view

    this.buildAvatar();
  }

  private buildAvatar() {
    const textureLoader = new THREE.TextureLoader();
    
    // Load the attached user image 3-removebg.png
    textureLoader.load('../../assets/images/3-removebg.png', (texture) => {
      // Calculate aspect ratio dynamically based on the loaded image
      const aspect = texture.image.width / texture.image.height;
      const height = 10; // Slightly decreased baseline size
      const width = height * aspect;
      
      const geo = new THREE.PlaneGeometry(width, height);
      
      // Using MeshBasicMaterial since it's a 2D image without normal maps
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      
      this.avatarMesh = new THREE.Mesh(geo, mat);
      this.scene.add(this.avatarMesh);
    }, undefined, (err) => {
      console.error('Error loading avatar image texture', err);
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!isPlatformBrowser(this.platformId)) return;
    const sec = document.querySelector('app-resume section');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    
    // 0 at start, 1 by the time About Me section has scrolled past
    let p = -rect.top / (window.innerHeight * 1.5);
    this.scrollTarget = Math.max(0, Math.min(1, p));
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.camera || !this.renderer) return;
    const el = this.container.nativeElement;
    this.camera.aspect = el.clientWidth / el.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(el.clientWidth, el.clientHeight);
  }

  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    // Smoothly lerp toward scroll target
    this.scrollProgress += (this.scrollTarget - this.scrollProgress) * 0.05;

    if (this.avatarMesh) {
      const sp = this.scrollProgress;
      
      // Make it stable (no floating or rotation)
      this.avatarMesh.position.set(0, 0, 0);
      this.avatarMesh.rotation.set(0, 0, 0);

      // On scroll down, dissolve and slightly decrease size
      const baseScale = window.innerWidth < 768 ? 0.6 : 1.0;
      const scale = Math.max(0.5, 1 - (sp * 0.3)) * baseScale; // Shrink size slightly
      this.avatarMesh.scale.set(scale, scale, scale);

      // Fade out based on scroll progress
      if (this.avatarMesh.material) {
        (this.avatarMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (sp * 1.5));
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
