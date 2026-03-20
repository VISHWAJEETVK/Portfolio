import {
  Component, ElementRef, ViewChild, AfterViewInit,
  HostListener, Inject, PLATFORM_ID, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

/** 3‑D pink-dot Brain that explodes outward on scroll */
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

  // Brain particles
  private particles!: THREE.Points;
  private basePositions!: Float32Array;   // resting brain shape
  private explodeVelocities!: Float32Array; // direction each dot flies on explode
  private particleCount = 1800;

  // Scroll state
  private explodeProgress = 0;   // 0 = formed, 1 = fully exploded
  private scrollTarget    = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.init();
      this.animate();
    }
  }
  ngOnDestroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.renderer) this.renderer.dispose();
  }

  // ── Scene ────────────────────────────────────────────────────
  private init() {
    const el = this.container.nativeElement;
    const w = el.clientWidth  || 400;
    const h = el.clientHeight || 400;

    this.scene = new THREE.Scene();
    // fully transparent — blends with page background
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    el.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 7);

    this.buildBrainParticles();
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  }

  // ── Build brain-shaped point cloud ───────────────────────────
  private buildBrainParticles() {
    const n = this.particleCount;
    const positions  = new Float32Array(n * 3);
    const colors     = new Float32Array(n * 3);
    const velocities = new Float32Array(n * 3);

    // Pink colour palette
    const palette = [
      new THREE.Color(0xff6eb0),   // hot pink
      new THREE.Color(0xff9dcf),   // light pink
      new THREE.Color(0xe040fb),   // purple-pink
      new THREE.Color(0xf48fb1),   // baby pink
      new THREE.Color(0xce93d8),   // lavender
    ];

    for (let i = 0; i < n; i++) {
      const pos = this.brainPoint();
      positions[i * 3]     = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      // Random outward explosion vector
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8
      );
      velocities[i * 3]     = v.x;
      velocities[i * 3 + 1] = v.y;
      velocities[i * 3 + 2] = v.z;
    }

    this.basePositions     = positions.slice();
    this.explodeVelocities = velocities;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

    const mat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  /** Sample a point roughly inside a brain silhouette (two lobes). */
  private brainPoint(): THREE.Vector3 {
    while (true) {
      const x = (Math.random() - 0.5) * 4.2;
      const y = (Math.random() - 0.5) * 3.2;
      const z = (Math.random() - 0.5) * 2.4;

      // Two-lobe shape: left lobe centred at (-0.7, 0) and right at (0.7, 0)
      const rx = 1.05, ry = 1.35, rz = 0.9;
      const leftLobe  = (((x + 0.8) / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2) < 1;
      const rightLobe = (((x - 0.8) / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2) < 1;

      // Slight brain-stem bulge at bottom
      const stem = (x / 0.4) ** 2 + ((y + 1.5) / 0.5) ** 2 + (z / 0.35) ** 2 < 1;

      if (leftLobe || rightLobe || stem) {
        return new THREE.Vector3(x, y, z);
      }
    }
  }

  // ── Scroll listener ──────────────────────────────────────────
  @HostListener('window:scroll')
  onScroll() {
    if (!isPlatformBrowser(this.platformId)) return;
    const sec = document.querySelector('app-resume section');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    // 0 at start, 1 by the time About Me section has scrolled ~35% past
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

  // ── Animation loop ───────────────────────────────────────────
  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    // Smoothly lerp toward scroll target
    this.explodeProgress += (this.scrollTarget - this.explodeProgress) * 0.04;

    const posAttr = this.particles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr  = posAttr.array as Float32Array;
    const base = this.basePositions;
    const vel  = this.explodeVelocities;
    const ep   = this.explodeProgress;
    const n    = this.particleCount;

    // Each particle lerps between brain position and exploded position
    for (let i = 0; i < n; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const bz = base[i * 3 + 2];

      // Gentle breathing oscillation for the formed brain
      const breathe = Math.sin(t * 1.2 + i * 0.05) * 0.04;

      arr[i * 3]     = bx + vel[i * 3]     * ep + breathe;
      arr[i * 3 + 1] = by + vel[i * 3 + 1] * ep + breathe;
      arr[i * 3 + 2] = bz + vel[i * 3 + 2] * ep;
    }
    posAttr.needsUpdate = true;

    // Fade out as exploded
    const mat = this.particles.material as THREE.PointsMaterial;
    mat.opacity = 0.9 - ep * 0.85;

    // Slow rotation of the whole brain
    this.particles.rotation.y = t * 0.2 + ep * Math.PI * 0.5;
    this.particles.rotation.x = Math.sin(t * 0.15) * 0.1;

    this.renderer.render(this.scene, this.camera);
  }
}
