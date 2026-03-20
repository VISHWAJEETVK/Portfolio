import {
  Component, ElementRef, ViewChild, AfterViewInit,
  HostListener, Inject, PLATFORM_ID, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

/**
 * Creative Journey visualisation:
 *  - A glowing "road" ribbon curves through the canvas top → bottom.
 *  - Three milestone "portals" (glowing rings + floating label sprites) mark
 *    Intern → Engineer → Senior Engineer.
 *  - A white comet (avatar) travels the road on scroll.
 *  - Background is transparent — same as site theme.
 */
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

  // Path
  private curve!: THREE.CatmullRomCurve3;

  // Comet / avatar
  private comet!: THREE.Mesh;
  private cometLight!: THREE.PointLight;
  private tail: THREE.Mesh[] = [];
  private tailPositions: THREE.Vector3[] = [];
  private readonly TAIL = 30;

  // Milestones
  private milestones: Array<{
    portal: THREE.Mesh; ring: THREE.Mesh; glowLight: THREE.PointLight;
    haloRing: THREE.Mesh; label: THREE.Sprite; t: number; base: THREE.Vector3;
  }> = [];

  // Particle dust
  private dust!: THREE.Points;

  // Scroll
  private scrollTarget = 0;
  private scrollDisplay = 0;

  private readonly STOPS = [
    { t: 0,   title: 'Intern',          sub: 'Sep 2021',  col: 0x38bdf8 },
    { t: 0.5, title: 'Engineer',        sub: 'Jan 2022',  col: 0x4ade80 },
    { t: 1,   title: 'Senior Engineer', sub: 'Jan 2024',  col: 0xf59e0b },
  ];

  constructor(@Inject(PLATFORM_ID) private pid: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.pid)) {
      setTimeout(() => { this.init(); this.loop(); }, 50);
    }
  }
  ngOnDestroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.renderer) this.renderer.dispose();
  }

  // ── Init ─────────────────────────────────────────────────────
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
    this.camera.position.set(0, 0, 13);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    this.buildDust();
    this.buildRoad();
    this.buildMilestones();
    this.buildComet();
    this.buildTail();
  }

  // ── Dust particles ───────────────────────────────────────────
  private buildDust() {
    const n = 400;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 4;
      const b = 0.3 + Math.random() * 0.4;
      col[i * 3] = b * 0.5; col[i * 3 + 1] = b * 0.8; col[i * 3 + 2] = b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    this.dust = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 0.45
    }));
    this.scene.add(this.dust);
  }

  // ── Glowing road ribbon (tube) ────────────────────────────────
  private buildRoad() {
    const pts = [
      new THREE.Vector3(-2.5,  7.5, -2),
      new THREE.Vector3( 2.0,  4.0,  0.5),
      new THREE.Vector3(-0.5,  0,    1),
      new THREE.Vector3( 2.0, -4.0,  0.5),
      new THREE.Vector3(-2.5, -7.5, -2),
    ];
    this.curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);

    // Outer glow
    const outerGeo = new THREE.TubeGeometry(this.curve, 150, 0.22, 12, false);
    this.scene.add(new THREE.Mesh(outerGeo, new THREE.MeshStandardMaterial({
      color: 0x008B8B, emissive: 0x004444, emissiveIntensity: 0.7,
      transparent: true, opacity: 0.18, roughness: 0.8
    })));

    // Core bright line
    const coreGeo = new THREE.TubeGeometry(this.curve, 150, 0.045, 6, false);
    this.scene.add(new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({
      color: 0x67e8f9, transparent: true, opacity: 0.9
    })));

    // Dashed chevrons along the road for a "highway" feel
    const totalLen = this.curve.getLength();
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const t0 = (i + 0.1) / steps;
      const t1 = (i + 0.4) / steps;
      const dashPts = [];
      for (let s = 0; s <= 6; s++) dashPts.push(this.curve.getPointAt(t0 + (t1 - t0) * (s / 6)));
      const dashGeo = new THREE.BufferGeometry().setFromPoints(dashPts);
      const dashMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
      this.scene.add(new THREE.Line(dashGeo, dashMat));
    }
  }

  // ── Milestones: hexagonal portal rings ───────────────────────
  private buildMilestones() {
    this.STOPS.forEach((s) => {
      const base = this.curve.getPointAt(s.t);

      // Hexagonal ring (torus with 6 segments = hex approximation)
      const portalGeo = new THREE.TorusGeometry(1.15, 0.07, 4, 6);
      const portalMat = new THREE.MeshStandardMaterial({
        color: s.col, emissive: s.col, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.8
      });
      const portal = new THREE.Mesh(portalGeo, portalMat);
      portal.position.copy(base);
      this.scene.add(portal);

      // Inner fill (transparent plane to imply a "gate")
      const fillGeo = new THREE.CircleGeometry(1.05, 6);
      const fillMat = new THREE.MeshBasicMaterial({
        color: s.col, transparent: true, opacity: 0.06, side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(fillGeo, fillMat);
      ring.position.copy(base);
      this.scene.add(ring);

      // Second outer ring (halo)
      const haloGeo = new THREE.TorusGeometry(1.5, 0.03, 4, 6);
      const haloMat = new THREE.MeshBasicMaterial({ color: s.col, transparent: true, opacity: 0.35 });
      const haloRing = new THREE.Mesh(haloGeo, haloMat);
      haloRing.position.copy(base);
      this.scene.add(haloRing);

      // Point light
      const glowLight = new THREE.PointLight(s.col, 2, 7);
      glowLight.position.copy(base);
      this.scene.add(glowLight);

      // Label sprite
      const label = this.makeSprite(s.title, s.sub, s.col);
      label.position.copy(base.clone().add(new THREE.Vector3(1.8, 0.5, 0)));
      this.scene.add(label);

      this.milestones.push({ portal, ring, glowLight, haloRing, label, t: s.t, base: base.clone() });
    });
  }

  private makeSprite(title: string, sub: string, hex: number): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 110;
    const ctx = canvas.getContext('2d')!;

    // Background pill
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    this.rrect(ctx, 4, 4, 292, 102, 16);
    ctx.fill();

    // Colour accent left bar
    ctx.fillStyle = '#' + hex.toString(16).padStart(6, '0');
    this.rrect(ctx, 4, 4, 7, 102, [16, 0, 0, 16]);
    ctx.fill();

    ctx.fillStyle = '#2F4F4F';
    ctx.font = 'bold 34px Inter,sans-serif';
    ctx.fillText(title, 20, 48);
    ctx.fillStyle = '#888';
    ctx.font = '26px Inter,sans-serif';
    ctx.fillText(sub, 20, 84);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sprite.scale.set(3.4, 1.25, 1);
    return sprite;
  }

  private rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
    const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r];
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br); ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl); ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
  }

  // ── Comet avatar ─────────────────────────────────────────────
  private buildComet() {
    // Cone pointing forward for a "rocket / comet" silhouette
    const geo = new THREE.ConeGeometry(0.22, 0.55, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2,
      roughness: 0, metalness: 1
    });
    this.comet = new THREE.Mesh(geo, mat);

    this.cometLight = new THREE.PointLight(0xffffff, 5, 10);
    this.comet.add(this.cometLight);
    this.comet.position.copy(this.curve.getPointAt(0));
    this.scene.add(this.comet);
  }

  // ── Tail ─────────────────────────────────────────────────────
  private buildTail() {
    const start = this.curve.getPointAt(0);
    for (let i = 0; i < this.TAIL; i++) {
      const frac = i / this.TAIL;
      const geo  = new THREE.SphereGeometry(0.08 * (1 - frac), 5, 5);
      const mat  = new THREE.MeshBasicMaterial({
        color: 0x67e8f9, transparent: true, opacity: (1 - frac) * 0.65
      });
      const bead = new THREE.Mesh(geo, mat);
      bead.position.copy(start);
      this.scene.add(bead);
      this.tail.push(bead);
      this.tailPositions.push(start.clone());
    }
  }

  // ── Scroll ───────────────────────────────────────────────────
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

  // ── Loop ─────────────────────────────────────────────────────
  private loop = () => {
    this.animId = requestAnimationFrame(this.loop);
    const t = this.clock.getElapsedTime();

    this.scrollDisplay += (this.scrollTarget - this.scrollDisplay) * 0.055;

    // Comet movement
    const pos = this.curve.getPointAt(this.scrollDisplay);
    this.comet.position.copy(pos);

    // Orient cone along tangent
    const tan = this.curve.getTangentAt(this.scrollDisplay);
    this.comet.quaternion.slerp(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan.normalize()), 0.15
    );
    this.comet.scale.setScalar(1 + Math.sin(t * 7) * 0.06);
    this.cometLight.intensity = 4.5 + Math.sin(t * 9) * 0.7;

    // Trail
    this.tailPositions.unshift(pos.clone());
    if (this.tailPositions.length > this.TAIL) this.tailPositions.pop();
    this.tail.forEach((b, i) => { if (this.tailPositions[i]) b.position.copy(this.tailPositions[i]); });

    // Milestones
    this.milestones.forEach((m, i) => {
      m.portal.position.y    = m.base.y + Math.sin(t * 0.9 + i) * 0.12;
      m.haloRing.position.y  = m.portal.position.y;
      m.ring.position.y      = m.portal.position.y;
      m.label.position.y     = m.portal.position.y + 0.5;
      m.portal.rotation.z    = t * (0.25 + i * 0.1);
      m.haloRing.rotation.z  = -t * (0.18 + i * 0.07);

      const proximity = Math.max(0, 1 - Math.abs(this.scrollDisplay - m.t) * 4);
      m.glowLight.intensity   = 2 + proximity * 5 + Math.sin(t * 5 + i) * 0.4;

      const sm = m.label.material as THREE.SpriteMaterial;
      sm.opacity = 0.25 + proximity * 0.75;
      m.label.scale.setScalar(0.82 + proximity * 0.28);
    });

    // Camera slow weave
    this.camera.position.x = Math.sin(t * 0.22) * 1.6;
    this.camera.position.y = Math.cos(t * 0.17) * 0.5;
    this.camera.lookAt(this.comet.position.x * 0.25, this.comet.position.y * 0.25, 0);

    // Dust drift
    if (this.dust) this.dust.rotation.y = t * 0.009;

    this.renderer.render(this.scene, this.camera);
  }
}
