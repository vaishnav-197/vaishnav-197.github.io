/* ============================================================
   Vaishnav Valsaraj — Portfolio
   Advanced 3D Scroll Animations
   - Scroll-assembled icosahedron from scattered fragments
   - Morphing geometry between sections
   - Floating particle field
   - 3D depth timeline & skills cards
   ============================================================ */

(function () {
  'use strict';

  // ── Globals ─────────────────────────────────────────────────
  const canvasContainer = document.getElementById('canvas-container');
  let scene, camera, renderer;
  let scrollPercent = 0;        // 0-1 across entire page
  let smoothScroll = 0;         // smoothed scroll
  let mouseX = 0, mouseY = 0;

  // 3D Object groups
  let fragmentGroup;            // scattered → assembled icosahedron
  let fragments = [];           // individual face meshes
  let particleSystem;           // floating particles
  let morphTargets = [];        // geometries to morph between
  let centralMesh;              // the morphing central shape
  let glowMesh;                 // glow sphere behind central

  // Floating interactive objects
  let floatingObjects = [];     // interactive 3D shapes
  let raycaster = null;
  let mouseVec = null;
  let dragTarget = null;        // currently dragged object
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let dragPrev = { x: 0, y: 0 };
  let dragVelocity = { x: 0, y: 0 };

  // Section scroll boundaries (computed on load)
  const sectionIds = ['hero', 'about', 'experience', 'skills', 'projects', 'blog', 'education', 'contact'];
  let sectionOffsets = [];

  // ── Init Three.js ───────────────────────────────────────────
  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f0d0b, 0.015);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 40);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    canvasContainer.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xc2410c, 0.3);
    scene.add(ambient);

    const dir1 = new THREE.DirectionalLight(0xea580c, 0.7);
    dir1.position.set(5, 8, 5);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x9a3412, 0.4);
    dir2.position.set(-5, -3, 8);
    scene.add(dir2);

    const point = new THREE.PointLight(0xc2410c, 0.5, 60);
    point.position.set(0, 0, 20);
    scene.add(point);

    createFragmentedIcosahedron();
    createParticleField();
    createMorphingCentral();
    createGlowSphere();
    createFloatingObjects();

    // Raycaster for object picking
    raycaster = new THREE.Raycaster();
    mouseVec = new THREE.Vector2();
  }

  // ── 1. Scroll-Assembled Icosahedron ─────────────────────────
  // Break an icosahedron into individual triangle faces.
  // They start scattered and assemble as the user scrolls
  // through the hero section.
  function createFragmentedIcosahedron() {
    fragmentGroup = new THREE.Group();
    scene.add(fragmentGroup);

    const baseGeo = new THREE.IcosahedronGeometry(6, 1); // detail=1 → 80 triangles
    const posAttr = baseGeo.getAttribute('position');
    const count = posAttr.count;

    // Process every 3 vertices (one triangle face)
    for (let i = 0; i < count; i += 3) {
      const triGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array(9); // 3 vertices × 3 components

      for (let v = 0; v < 3; v++) {
        vertices[v * 3]     = posAttr.getX(i + v);
        vertices[v * 3 + 1] = posAttr.getY(i + v);
        vertices[v * 3 + 2] = posAttr.getZ(i + v);
      }

      triGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      triGeo.computeVertexNormals();

      // Centroid of this triangle (assembled position)
      const cx = (vertices[0] + vertices[3] + vertices[6]) / 3;
      const cy = (vertices[1] + vertices[4] + vertices[7]) / 3;
      const cz = (vertices[2] + vertices[5] + vertices[8]) / 3;

      // Pick a random color from palette
      const colors = [0xc2410c, 0xea580c, 0x9a3412, 0xf97316, 0x78350f];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const mat = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.35,
        roughness: 0.4,
        metalness: 0.6,
        side: THREE.DoubleSide,
        wireframe: Math.random() > 0.6,
      });

      const mesh = new THREE.Mesh(triGeo, mat);

      // Scattered position (random explosion outward)
      const scatterDist = 20 + Math.random() * 30;
      const dir = new THREE.Vector3(
        cx + (Math.random() - 0.5) * 10,
        cy + (Math.random() - 0.5) * 10,
        cz + (Math.random() - 0.5) * 10
      ).normalize();

      mesh.userData = {
        // Assembled state (original position)
        assembledPos: new THREE.Vector3(0, 0, 0), // relative to group
        assembledRot: new THREE.Euler(0, 0, 0),
        // Scattered state
        scatteredPos: dir.multiplyScalar(scatterDist),
        scatteredRot: new THREE.Euler(
          Math.random() * Math.PI * 4,
          Math.random() * Math.PI * 4,
          Math.random() * Math.PI * 4
        ),
        // Random phase for subtle animation
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.3 + Math.random() * 0.5,
      };

      // Start scattered
      mesh.position.copy(mesh.userData.scatteredPos);
      mesh.rotation.copy(mesh.userData.scatteredRot);

      fragmentGroup.add(mesh);
      fragments.push(mesh);
    }

    baseGeo.dispose();
  }

  // ── 2. Floating Particle Field ──────────────────────────────
  function createParticleField() {
    const count = 600;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0xc2410c),
      new THREE.Color(0xea580c),
      new THREE.Color(0x9a3412),
      new THREE.Color(0xf97316),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
      sizes[i] = Math.random() * 2 + 0.5;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    particleSystem = new THREE.Points(geo, mat);
    scene.add(particleSystem);
  }

  // ── 3. Morphing Central Shape ───────────────────────────────
  // After the icosahedron assembles, a central shape appears
  // and morphs between geometries as you scroll through sections.
  function createMorphingCentral() {
    // Target geometries for each section (after hero)
    morphTargets = [
      new THREE.TorusGeometry(3.5, 1.2, 16, 100),      // about
      new THREE.TorusKnotGeometry(2.5, 0.8, 128, 16),   // experience
      new THREE.OctahedronGeometry(4, 0),                // skills
      new THREE.DodecahedronGeometry(3.5, 0),            // projects
      new THREE.IcosahedronGeometry(3.5, 0),             // education
      new THREE.SphereGeometry(3, 32, 32),               // contact
    ];

    const mat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      wireframe: true,
      transparent: true,
      opacity: 0,
      roughness: 0.3,
      metalness: 0.7,
    });

    centralMesh = new THREE.Mesh(morphTargets[0], mat);
    centralMesh.position.set(15, 0, -5);
    scene.add(centralMesh);
  }

  // ── 4. Glow Sphere ─────────────────────────────────────────
  function createGlowSphere() {
    const geo = new THREE.SphereGeometry(5, 32, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xc2410c,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    glowMesh = new THREE.Mesh(geo, mat);
    glowMesh.position.set(15, 0, -8);
    scene.add(glowMesh);
  }

  // ── 5. Floating Interactive Objects ─────────────────────────
  function createFloatingObjects() {
    const geometryFactories = [
      () => new THREE.TorusGeometry(1, 0.4, 12, 48),
      () => new THREE.OctahedronGeometry(1.2, 0),
      () => new THREE.DodecahedronGeometry(1, 0),
      () => new THREE.IcosahedronGeometry(1, 0),
      () => new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8),
      () => new THREE.ConeGeometry(0.8, 1.6, 6),
      () => new THREE.TetrahedronGeometry(1.1, 0),
      () => new THREE.BoxGeometry(1.2, 1.2, 1.2),
    ];

    const colors = [0xc2410c, 0xea580c, 0x9a3412, 0xf97316, 0x78350f, 0xb45309];
    const objectCount = 18;

    for (let i = 0; i < objectCount; i++) {
      const geoFn = geometryFactories[Math.floor(Math.random() * geometryFactories.length)];
      const geo = geoFn();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const scale = 0.5 + Math.random() * 1.5;

      // Wireframe shell
      const wireMat = new THREE.MeshStandardMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
        roughness: 0.3,
        metalness: 0.8,
      });

      // Solid inner (subtle)
      const solidMat = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.08,
        roughness: 0.5,
        metalness: 0.6,
        side: THREE.DoubleSide,
      });

      const group = new THREE.Group();
      const wireMesh = new THREE.Mesh(geo, wireMat);
      const solidMesh = new THREE.Mesh(geo.clone(), solidMat);
      solidMesh.scale.setScalar(0.95);
      group.add(wireMesh);
      group.add(solidMesh);

      // Spread across the scene
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 80;
      const z = -5 - Math.random() * 12;
      group.position.set(x, y, z);
      group.scale.setScalar(scale);

      // Random initial rotation
      group.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      group.userData = {
        basePos: new THREE.Vector3(x, y, z),
        baseScale: scale,
        currentScale: scale,
        phase: Math.random() * Math.PI * 2,
        floatSpeedX: 0.2 + Math.random() * 0.4,
        floatSpeedY: 0.3 + Math.random() * 0.5,
        rotSpeedX: (Math.random() - 0.5) * 0.3,
        rotSpeedY: (Math.random() - 0.5) * 0.3,
        rotSpeedZ: (Math.random() - 0.5) * 0.2,
        // Inertia for drag rotation
        inertiaX: 0,
        inertiaY: 0,
        // Track hover glow
        hoverAmount: 0,
        wireMat: wireMat,
        solidMat: solidMat,
        originalColor: new THREE.Color(color),
      };

      scene.add(group);
      floatingObjects.push(group);
    }
  }

  // ── Update floating objects each frame ──────────────────────
  function updateFloatingObjects(time) {
    // Project mouse to world space for proximity check
    const mouseWorld = new THREE.Vector3(
      mouseX * 40,  // rough world-space mapping
      -mouseY * 25 + smoothScroll * -15,
      0
    );

    floatingObjects.forEach(obj => {
      const ud = obj.userData;

      // ── Idle float animation
      const floatX = Math.sin(time * ud.floatSpeedX + ud.phase) * 0.8;
      const floatY = Math.cos(time * ud.floatSpeedY + ud.phase * 1.3) * 0.6;
      obj.position.x = ud.basePos.x + floatX;
      obj.position.y = ud.basePos.y + floatY;

      // Scroll parallax (deeper objects move less)
      const depthFactor = Math.abs(ud.basePos.z) / 15;
      obj.position.y -= smoothScroll * 20 * depthFactor;

      // ── Idle rotation (slowed when dragging this object)
      if (dragTarget !== obj) {
        obj.rotation.x += ud.rotSpeedX * 0.016;
        obj.rotation.y += ud.rotSpeedY * 0.016;
        obj.rotation.z += ud.rotSpeedZ * 0.016;
      }

      // ── Apply inertia from drag release
      if (Math.abs(ud.inertiaX) > 0.001 || Math.abs(ud.inertiaY) > 0.001) {
        obj.rotation.x += ud.inertiaX;
        obj.rotation.y += ud.inertiaY;
        ud.inertiaX *= 0.96;  // friction decay
        ud.inertiaY *= 0.96;
      }

      // ── Mouse proximity interaction
      const screenPos = obj.position.clone().project(camera);
      const dx = (mouseX) - screenPos.x * 0.5;
      const dy = (-mouseY) - screenPos.y * 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximityThreshold = 0.2;

      if (dist < proximityThreshold && !isDragging) {
        // Scale up, glow
        const strength = 1 - (dist / proximityThreshold);
        ud.hoverAmount = lerp(ud.hoverAmount, strength, 0.08);
      } else {
        ud.hoverAmount = lerp(ud.hoverAmount, 0, 0.05);
      }

      // Apply hover effects
      const targetScale = ud.baseScale * (1 + ud.hoverAmount * 0.3);
      ud.currentScale = lerp(ud.currentScale, targetScale, 0.08);
      obj.scale.setScalar(ud.currentScale);

      // Glow: increase opacity & emissive
      ud.wireMat.opacity = 0.25 + ud.hoverAmount * 0.35;
      ud.solidMat.opacity = 0.08 + ud.hoverAmount * 0.12;

      const glowColor = ud.originalColor.clone();
      glowColor.lerp(new THREE.Color(0xffffff), ud.hoverAmount * 0.3);
      ud.wireMat.color.copy(glowColor);

      // Faster spin on hover
      if (ud.hoverAmount > 0.1 && dragTarget !== obj) {
        obj.rotation.x += ud.rotSpeedX * 0.03 * ud.hoverAmount;
        obj.rotation.y += ud.rotSpeedY * 0.03 * ud.hoverAmount;
      }

      // Push away from cursor
      if (ud.hoverAmount > 0.05) {
        const pushDir = obj.position.clone().sub(mouseWorld).normalize();
        obj.position.add(pushDir.multiplyScalar(ud.hoverAmount * 0.08));
      }
    });
  }

  // ── Compute section scroll offsets ──────────────────────────
  function computeSectionOffsets() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    sectionOffsets = sectionIds.map(id => {
      const el = document.getElementById(id);
      return el ? el.offsetTop / docH : 0;
    });
  }

  // Get which section we're in (0-based) and local progress (0-1)
  function getCurrentSection() {
    for (let i = sectionOffsets.length - 1; i >= 0; i--) {
      if (smoothScroll >= sectionOffsets[i]) {
        const nextOffset = sectionOffsets[i + 1] || 1;
        const localProgress = Math.min(
          (smoothScroll - sectionOffsets[i]) / (nextOffset - sectionOffsets[i]),
          1
        );
        return { index: i, progress: localProgress };
      }
    }
    return { index: 0, progress: 0 };
  }

  // ── Animation Loop ─────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    const time = performance.now() * 0.001;

    // Smooth scroll interpolation
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const rawPercent = docH > 0 ? window.pageYOffset / docH : 0;
    smoothScroll += (rawPercent - smoothScroll) * 0.06;

    const sec = getCurrentSection();

    // ── Update fragments (assembled icosahedron) ──
    // Hero section (index 0): fragments assemble over scroll progress
    const assembleProgress = sec.index === 0
      ? easeInOutCubic(Math.min(sec.progress * 0.8, 1))
      : 1; // fully assembled after hero

    const fragmentsVisible = smoothScroll < 0.25; // fade out after hero

    fragments.forEach((frag, i) => {
      const ud = frag.userData;

      // Interpolate position between scattered and assembled
      frag.position.lerpVectors(ud.scatteredPos, ud.assembledPos, assembleProgress);

      // Interpolate rotation
      frag.rotation.x = lerp(ud.scatteredRot.x, ud.assembledRot.x, assembleProgress);
      frag.rotation.y = lerp(ud.scatteredRot.y, ud.assembledRot.y, assembleProgress);
      frag.rotation.z = lerp(ud.scatteredRot.z, ud.assembledRot.z, assembleProgress);

      // Subtle float when assembled
      if (assembleProgress > 0.8) {
        const floatAmt = (assembleProgress - 0.8) * 5; // 0 to 1
        frag.position.y += Math.sin(time * ud.floatSpeed + ud.phase) * 0.15 * floatAmt;
      }

      // Opacity
      frag.material.opacity = fragmentsVisible
        ? lerp(0.1, 0.35, assembleProgress)
        : lerp(0.35, 0, (smoothScroll - 0.2) * 10);
    });

    // Rotate assembled group slowly
    fragmentGroup.rotation.y = time * 0.15 + smoothScroll * 2;
    fragmentGroup.rotation.x = Math.sin(time * 0.1) * 0.1;

    // ── Update morphing central shape ──
    if (sec.index >= 1) {
      const morphIdx = Math.min(sec.index - 1, morphTargets.length - 1);

      // Swap geometry when entering a new section
      if (centralMesh.geometry !== morphTargets[morphIdx]) {
        centralMesh.geometry = morphTargets[morphIdx];
      }

      // Fade in and position
      centralMesh.material.opacity = lerp(0, 0.2, Math.min(sec.progress * 3, 1));

      // Float on the right side, move based on section
      const yTarget = 5 - sec.index * 2;
      centralMesh.position.y = lerp(centralMesh.position.y, yTarget, 0.03);

      // Rotate
      centralMesh.rotation.x = time * 0.3;
      centralMesh.rotation.y = time * 0.2;
      centralMesh.rotation.z = Math.sin(time * 0.15) * 0.3;

      // Scale pulse
      const pulse = 1 + Math.sin(time * 0.8) * 0.05;
      centralMesh.scale.setScalar(pulse);

      // Glow
      glowMesh.material.opacity = centralMesh.material.opacity * 0.15;
      glowMesh.position.copy(centralMesh.position);
      glowMesh.position.z -= 3;
      glowMesh.scale.setScalar(pulse * 1.5);
    } else {
      centralMesh.material.opacity = 0;
      glowMesh.material.opacity = 0;
    }

    // ── Update particles ──
    particleSystem.rotation.y = time * 0.02 + smoothScroll * 0.5;
    particleSystem.rotation.x = Math.sin(time * 0.01) * 0.1;

    // Shift particles with scroll
    const positions = particleSystem.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const ix = i * 3;
      // Subtle upward drift
      positions.array[ix + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.003;
    }
    positions.needsUpdate = true;

    // ── Update floating interactive objects ──
    updateFloatingObjects(time);

    // ── Camera ──
    // Mouse parallax
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2 - camera.position.y + smoothScroll * -15) * 0.02;
    camera.lookAt(0, smoothScroll * -15, 0);

    renderer.render(scene, camera);
  }

  // ── Utility Functions ───────────────────────────────────────
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // ── 5. 3D Timeline Cards (CSS transform driven) ────────────
  function initTimelineCards() {
    const items = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('timeline-visible');
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -80px 0px' });

    items.forEach((item, i) => {
      item.style.transitionDelay = `${i * 0.15}s`;
      observer.observe(item);
    });
  }

  // ── 6. Exploding Skills Cards ──────────────────────────────
  function initSkillsCards() {
    const cards = document.querySelectorAll('.skill-category');
    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          cards.forEach((card, i) => {
            setTimeout(() => {
              card.classList.add('skill-exploded');
            }, i * 120);
          });
        }
      });
    }, { threshold: 0.15 });

    const skillsSection = document.getElementById('skills');
    if (skillsSection) observer.observe(skillsSection);
  }

  // ── 7. Project Cards 3D Tilt ───────────────────────────────
  function initProjectTilt() {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px)';
      });
    });
  }

  // ── Scroll Reveal ───────────────────────────────────────────
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // ── Navbar ──────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.pageYOffset > 50);
  }

  // ── Mobile Hamburger ────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ── Active Nav Highlighting ─────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = navLinks.querySelectorAll('a');

  function highlightNav() {
    let current = '';
    sections.forEach(section => {
      if (window.pageYOffset >= section.offsetTop - 200) {
        current = section.getAttribute('id');
      }
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  // ── Smooth Scroll ───────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Event Listeners ─────────────────────────────────────────
  window.addEventListener('scroll', () => {
    updateNavbar();
    highlightNav();
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;

    // Drag rotation
    if (isDragging && dragTarget) {
      const deltaX = e.clientX - dragPrev.x;
      const deltaY = e.clientY - dragPrev.y;
      dragTarget.rotation.y += deltaX * 0.01;
      dragTarget.rotation.x += deltaY * 0.01;
      dragVelocity.x = deltaY * 0.01;
      dragVelocity.y = deltaX * 0.01;
      dragPrev.x = e.clientX;
      dragPrev.y = e.clientY;
    }
  });

  // ── Drag / Swipe to rotate objects ────────────────────────
  function getPointerPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function onPointerDown(e) {
    const pos = getPointerPos(e);
    mouseVec.x = (pos.x / window.innerWidth) * 2 - 1;
    mouseVec.y = -(pos.y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouseVec, camera);

    // Collect all meshes inside floating object groups
    const allMeshes = [];
    floatingObjects.forEach(group => {
      group.traverse(child => {
        if (child.isMesh) {
          child._parentGroup = group; // stash ref
          allMeshes.push(child);
        }
      });
    });

    const intersects = raycaster.intersectObjects(allMeshes, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      dragTarget = hit._parentGroup || hit;
      isDragging = true;
      dragStart.x = pos.x;
      dragStart.y = pos.y;
      dragPrev.x = pos.x;
      dragPrev.y = pos.y;
      dragVelocity.x = 0;
      dragVelocity.y = 0;

      // Stop inertia on grab
      if (dragTarget.userData) {
        dragTarget.userData.inertiaX = 0;
        dragTarget.userData.inertiaY = 0;
      }

      // Prevent scroll while dragging on touch
      if (e.cancelable) e.preventDefault();
    }
  }

  function onPointerMove(e) {
    if (!isDragging || !dragTarget) return;
    const pos = getPointerPos(e);
    const deltaX = pos.x - dragPrev.x;
    const deltaY = pos.y - dragPrev.y;
    dragTarget.rotation.y += deltaX * 0.01;
    dragTarget.rotation.x += deltaY * 0.01;
    dragVelocity.x = deltaY * 0.01;
    dragVelocity.y = deltaX * 0.01;
    dragPrev.x = pos.x;
    dragPrev.y = pos.y;
    if (e.cancelable) e.preventDefault();
  }

  function onPointerUp() {
    if (isDragging && dragTarget && dragTarget.userData) {
      // Apply inertia
      dragTarget.userData.inertiaX = dragVelocity.x;
      dragTarget.userData.inertiaY = dragVelocity.y;
    }
    isDragging = false;
    dragTarget = null;
  }

  // Mouse events on canvas
  canvasContainer.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mouseup', onPointerUp);

  // Touch events on canvas
  canvasContainer.addEventListener('touchstart', onPointerDown, { passive: false });
  canvasContainer.addEventListener('touchmove', onPointerMove, { passive: false });
  canvasContainer.addEventListener('touchend', onPointerUp);

  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    computeSectionOffsets();
  });

  // ── Init Everything ─────────────────────────────────────────
  // ── Fetch Medium Blog Posts ──────────────────────────────────
  function fetchMediumPosts() {
    const MEDIUM_USER = 'vyshnav18';
    const RSS_URL = `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${MEDIUM_USER}`;
    const blogGrid = document.getElementById('blogGrid');

    fetch(RSS_URL)
      .then(res => res.json())
      .then(data => {
        if (data.status !== 'ok' || !data.items || data.items.length === 0) {
          blogGrid.innerHTML = `
            <div class="blog-loading">
              <p>No posts found. <a href="https://medium.com/@${MEDIUM_USER}" target="_blank" rel="noopener" style="color: var(--accent-2);">Visit Medium →</a></p>
            </div>`;
          return;
        }

        const posts = data.items.slice(0, 6); // show up to 6 posts
        blogGrid.innerHTML = posts.map((post, i) => {
          // Extract thumbnail — filter out Medium tracking pixels
          const isRealImage = (url) => url && !url.includes('/stat?') && !url.includes('medium.com/_/') && url.match(/\.(jpg|jpeg|png|gif|webp)/i);
          const contentImgs = [...post.description.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]);
          const realContentImg = contentImgs.find(isRealImage) || '';
          const thumbnail = isRealImage(post.thumbnail) ? post.thumbnail : realContentImg;

          // Strip HTML for excerpt
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = post.description;
          const excerpt = tempDiv.textContent.substring(0, 150).trim() + '…';

          // Format date
          const date = new Date(post.pubDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          // Tags (categories)
          const tags = (post.categories || []).slice(0, 3);
          const tagsHtml = tags.map(t => `<span class="blog-card-tag">${t}</span>`).join('');

          return `
            <a href="${post.link}" target="_blank" rel="noopener noreferrer"
               class="blog-card reveal reveal-delay-${Math.min(i + 1, 4)}">
              ${thumbnail ? `<img class="blog-card-thumbnail" src="${thumbnail}" alt="${post.title}" loading="lazy" />` : ''}
              <div class="blog-card-body">
                ${tagsHtml ? `<div class="blog-card-tags">${tagsHtml}</div>` : ''}
                <h3>${post.title}</h3>
                <p>${excerpt}</p>
                <div class="blog-card-footer">
                  <span class="blog-card-date">${date}</span>
                  <span class="blog-card-read">Read →</span>
                </div>
              </div>
            </a>`;
        }).join('');

        // Re-trigger scroll reveal for new blog cards
        initScrollReveal();
      })
      .catch(() => {
        blogGrid.innerHTML = `
          <div class="blog-loading">
            <p>Couldn't load posts. <a href="https://medium.com/@${MEDIUM_USER}" target="_blank" rel="noopener" style="color: var(--accent-2);">Visit on Medium →</a></p>
          </div>`;
      });
  }

  initThree();
  computeSectionOffsets();
  initScrollReveal();
  initTimelineCards();
  initSkillsCards();
  initProjectTilt();
  fetchMediumPosts();
  animate();

  // Recompute on full load (images etc.)
  window.addEventListener('load', computeSectionOffsets);
})();
