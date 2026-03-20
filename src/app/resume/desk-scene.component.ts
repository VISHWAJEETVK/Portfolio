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
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate/50 font-medium tracking-widest uppercase pointer-events-none z-10">
      </div>
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

  // Desk parts
  private monitor!: THREE.Group;
  private keyboard!: THREE.Group;
  private lamp!: THREE.Group;
  private screen!: THREE.Mesh;
  private screenMat!: THREE.MeshStandardMaterial;
  private codeLines: THREE.Mesh[] = [];
  private ambient!: THREE.AmbientLight;
  private lampLight!: THREE.PointLight;

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

  private init() {
    const el = this.container.nativeElement;
    const w = el.clientWidth || 800, h = el.clientHeight || 420;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f4f7f5');
    this.scene.fog = new THREE.Fog('#f4f7f5', 18, 30);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 60);
    this.camera.position.set(0, 3.5, 10);
    this.camera.lookAt(0, 1, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(this.renderer.domElement);

    // Lights
    this.ambient = new THREE.AmbientLight(0xdce8e0, 0.6);
    this.scene.add(this.ambient);

    const sun = new THREE.DirectionalLight(0xfff5e0, 0.8);
    sun.position.set(5, 10, 5);
    sun.castShadow = true;
    this.scene.add(sun);

    this.lampLight = new THREE.PointLight(0x4ade80, 2.5, 12);
    this.lampLight.position.set(2.5, 5, 2);
    this.lampLight.castShadow = true;
    this.scene.add(this.lampLight);

    // Fill teal backlight
    const tealFill = new THREE.PointLight(0x008B8B, 0.8, 15);
    tealFill.position.set(-4, 2, -2);
    this.scene.add(tealFill);

    this.buildDesk();
    this.buildMonitor();
    this.buildKeyboard();
    this.buildLamp();
    this.buildPlant();
    this.buildCodeLinesFX();
  }

  private mat(color: number, rough = 0.5, metal = 0.1) {
    return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  }

  private buildDesk() {
    // Desk surface
    const deskGeo = new THREE.BoxGeometry(14, 0.25, 6);
    const deskMesh = new THREE.Mesh(deskGeo, this.mat(0xd4a57a, 0.8, 0.0));
    deskMesh.position.set(0, 0, 0);
    deskMesh.receiveShadow = true;
    this.scene.add(deskMesh);

    // Desk edge trim
    const trim = new THREE.Mesh(new THREE.BoxGeometry(14, 0.04, 0.1), this.mat(0xb8894e, 0.6, 0.2));
    trim.position.set(0, 0.14, 3.05);
    this.scene.add(trim);

    // Desk legs
    const legMat = this.mat(0xb8894e, 0.7, 0.0);
    [[-6, -1.2], [6, -1.2]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 0.3), legMat);
      leg.position.set(x, -1.375, z as number);
      leg.castShadow = true;
      this.scene.add(leg);
    });

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), this.mat(0xe8eceb, 0.9, 0.0));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.65;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  private buildMonitor() {
    this.monitor = new THREE.Group();

    // Screen bezel
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.2, 0.15), this.mat(0x1e2635, 0.5, 0.6));
    bezel.castShadow = true;
    this.monitor.add(bezel);

    // Screen panel
    const screenGeo = new THREE.PlaneGeometry(4.8, 2.8);
    this.screenMat = new THREE.MeshStandardMaterial({ color: 0x0d1117, emissive: 0x0d1117, emissiveIntensity: 0.4, roughness: 1 });
    this.screen = new THREE.Mesh(screenGeo, this.screenMat);
    this.screen.position.set(0, 0, 0.09);
    this.monitor.add(this.screen);

    // Stand neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.2, 12), this.mat(0x2a2a2a, 0.4, 0.7));
    neck.position.set(0, -2.1, 0.2);
    this.monitor.add(neck);

    // Stand base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.12, 20), this.mat(0x2a2a2a, 0.4, 0.7));
    base.position.set(0, -2.7, 0.2);
    this.monitor.add(base);

    // Screen glow effect (subtle emissive plane behind)
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.05 });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.3), glowMat);
    glow.position.set(0, 0, -0.2);
    this.monitor.add(glow);

    this.monitor.position.set(-0.5, 2.2, -1.5);
    this.scene.add(this.monitor);
  }

  private buildKeyboard() {
    this.keyboard = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 1.3), this.mat(0xd0d4d8, 0.6, 0.3));
    body.castShadow = true;
    this.keyboard.add(body);

    // Key rows
    const keyMat = this.mat(0xc0c4c8, 0.7, 0.2);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 12; col++) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.22), keyMat);
        key.position.set(-1.6 + col * 0.27, 0.1, -0.4 + row * 0.27);
        this.keyboard.add(key);
      }
    }

    // Spacebar
    const space = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.22), this.mat(0xb0b4b8, 0.6, 0.3));
    space.position.set(0, 0.1, 0.7);
    this.keyboard.add(space);

    this.keyboard.position.set(-0.5, 0.19, 1.5);
    this.scene.add(this.keyboard);
  }

  private buildLamp() {
    this.lamp = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.5, 10), this.mat(0x2a2a2a, 0.4, 0.8));
    pole.position.y = 1.75;
    this.lamp.add(pole);

    // Arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), this.mat(0x2a2a2a, 0.4, 0.8));
    arm.rotation.z = Math.PI / 4;
    arm.position.set(0.65, 3.2, 0);
    this.lamp.add(arm);

    // Shade
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.5, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xf5d060, side: THREE.DoubleSide, roughness: 0.5 }));
    shade.position.set(1.3, 3.7, 0);
    this.lamp.add(shade);

    this.lamp.position.set(4.5, 0.12, -0.5);
    this.scene.add(this.lamp);
  }

  private buildPlant() {
    // Pot
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.6, 12), this.mat(0xc0724a, 0.8, 0.0));
    pot.position.set(-4.5, 0.42, 0.5);
    pot.castShadow = true;
    this.scene.add(pot);

    // Leaves (spherical cluster, green)
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9, metalness: 0.0 });
    [[0, 1.1, 0], [0.3, 0.9, 0.2], [-0.3, 1.0, -0.1], [0.1, 1.3, -0.2]].forEach(([x, y, z]) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.1, 10, 10), leafMat);
      leaf.position.set(-4.5 + x, 0.4 + y, 0.5 + z);
      leaf.castShadow = true;
      this.scene.add(leaf);
    });
  }

  private buildCodeLinesFX() {
    // Floating code-line rectangles on screen to simulate text
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.7 });
    const commentMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
    const widths = [1.8, 2.4, 1.2, 2.0, 0.8, 1.6, 2.2, 1.4];
    for (let i = 0; i < widths.length; i++) {
      const geo = new THREE.PlaneGeometry(widths[i], 0.07);
      const mat = i % 3 === 0 ? commentMat : lineMat;
      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(-2.3 + widths[i] / 2, 0.9 - i * 0.3, 0.11);
      this.screen.add(bar);
      this.codeLines.push(bar);
    }

    // Blinking cursor
    const cursorGeo = new THREE.PlaneGeometry(0.06, 0.22);
    const cursor = new THREE.Mesh(cursorGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    cursor.position.set(-2.2, 0.9 - 7 * 0.3, 0.11);
    this.screen.add(cursor);
    this.codeLines.push(cursor);
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

    // Smooth mouse follow
    this.targetX += (this.mouseX - this.targetX) * 0.05;
    this.targetY += (this.mouseY - this.targetY) * 0.05;

    // Camera tilt on mouse input
    this.camera.position.x = this.targetX * 1.2;
    this.camera.position.y = 3.5 + this.targetY * 0.5;
    this.camera.lookAt(0, 1, 0);

    // Lamp light flicker
    this.lampLight.intensity = 2.5 + Math.sin(t * 3) * 0.15;

    // Code lines blink / scroll
    const lastLine = this.codeLines[this.codeLines.length - 1]; // cursor
    if (lastLine) {
      const mat = lastLine.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.round(Math.sin(t * 3) * 0.5 + 0.5);
    }

    // Subtle keyboard hover
    this.keyboard.position.y = 0.19 + Math.sin(t * 0.5) * 0.003;

    this.renderer.render(this.scene, this.camera);
  }
}
