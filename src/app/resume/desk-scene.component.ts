import {
  Component, ElementRef, ViewChild, AfterViewInit,
  HostListener, Inject, PLATFORM_ID, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-desk-scene',
  standalone: true,
  template: `
    <div class="relative w-full" style="height: 600px;">
      <div #container class="absolute inset-0 rounded-3xl overflow-hidden"></div>
    </div>`,
  styles: [`:host { display: block; }`]
})
export class DeskSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animId!: number;
  private clock = new THREE.Clock();

  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;

  private avatarMesh!: THREE.Mesh;

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
    const w = el.clientWidth || 800, h = el.clientHeight || 420;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 60);
    this.camera.position.set(0, 0, 15);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1));

    this.buildAvatar();
  }

  private buildAvatar() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('../../assets/images/2-removebg.png', (texture) => {
      // Automatic aspect ratio matching prevents any clipping/stretching
      const aspect = texture.image.width / texture.image.height;
      const height = 8.4; // Scaled down by ~30%
      const width = height * aspect;
      
      const geo = new THREE.PlaneGeometry(width, height);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      
      this.avatarMesh = new THREE.Mesh(geo, mat);
      this.scene.add(this.avatarMesh);
    }, undefined, (err) => console.error("Error loading texture 2:", err));
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const el = this.container.nativeElement;
    const rect = el.getBoundingClientRect();
    this.mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    this.mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
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

    this.targetX += (this.mouseX - this.targetX) * 0.05;
    this.targetY += (this.mouseY - this.targetY) * 0.05;

    // React to mouse movements slightly
    if (this.avatarMesh) {
      const baseScale = window.innerWidth < 768 ? 0.5 : 1.0;
      this.avatarMesh.scale.setScalar(baseScale);

      this.avatarMesh.position.x = this.targetX * 0.5;
      this.avatarMesh.position.y = Math.sin(t * 1.5) * 0.2 - (this.targetY * 0.5);
      this.avatarMesh.rotation.y = this.targetX * 0.2;
      this.avatarMesh.rotation.x = -this.targetY * 0.1;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
