import {
  Component, ElementRef, ViewChild, AfterViewInit,
  HostListener, Inject, PLATFORM_ID, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-journey-canvas',
  standalone: true,
  template: `<div #c class="w-full h-full"></div>`,
  styles: [`:host{display:block;width:100%;height:100%}`]
})
export class JourneyCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('c') containerRef!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animId!: number;
  private clock = new THREE.Clock();

  private avatarMesh!: THREE.Mesh;
  private scrollProgress = 0;
  private scrollTarget = 0;

  constructor(@Inject(PLATFORM_ID) private pid: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.pid)) {
      setTimeout(() => { this.init(); this.loop(); }, 50);
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
    const el = this.containerRef.nativeElement;
    const w = el.clientWidth || 380, h = el.clientHeight || 500;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    el.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 120);
    this.camera.position.set(0, 0, 12);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1));
    this.buildAvatar();
  }

  private buildAvatar() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('../../assets/images/4-removebg.png', (texture) => {
      // Exact aspect ratio calculation keeps it perfectly proportional
      const aspect = texture.image.width / texture.image.height;
      const height = 14; 
      const width = height * aspect;
      
      const geo = new THREE.PlaneGeometry(width, height);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      
      this.avatarMesh = new THREE.Mesh(geo, mat);
      this.scene.add(this.avatarMesh);
    }, undefined, (err) => console.error("Error loading texture 4:", err));
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!isPlatformBrowser(this.pid)) return;
    const sec = document.getElementById('experience-section');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    let p = (window.innerHeight / 2 - rect.top) / rect.height;
    this.scrollTarget = Math.max(0, Math.min(1, p));
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.camera || !this.renderer) return;
    const el = this.containerRef.nativeElement;
    this.camera.aspect = el.clientWidth / el.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(el.clientWidth, el.clientHeight);
  }

  private loop = () => {
    this.animId = requestAnimationFrame(this.loop);
    const t = this.clock.getElapsedTime();

    this.scrollProgress += (this.scrollTarget - this.scrollProgress) * 0.055;

    if (this.avatarMesh) {
      const sp = this.scrollProgress;
      
      const baseScale = window.innerWidth < 768 ? 0.2 : 1.0;
      this.avatarMesh.scale.setScalar(baseScale);

      // Slowly float vertically based on scroll progress so it tracks alongside the work history cards
      this.avatarMesh.position.y = (sp * -8) + Math.sin(t * 2) * 0.2;
      this.avatarMesh.rotation.y = Math.sin(t * 1) * 0.1;
      this.avatarMesh.rotation.z = Math.sin(t * 1.5) * 0.03;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
