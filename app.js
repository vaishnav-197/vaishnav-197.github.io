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

  // Section scroll boundaries (computed on load)
  const sectionIds = ['hero', 'about', 'experience', 'skills', 'projects', 'education', 'contact'];
  let sectionOffsets = [];

  // ── Init Three.js ───────────────────────────────────────────
  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 40);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    canvasContainer.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0x6366f1, 0.3);
    scene.add(ambient);

    const dir1 = new THREE.DirectionalLight(0x8b5cf6, 0.7);
    dir1.position.set(5, 8, 5);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xec4899, 0.4);
    dir2.position.set(-5, -3, 8);
    scene.add(dir2);

    const point = new THREE.PointLight(0x6366f1, 0.5, 60);
    point.position.set(0, 0, 20);
    scene.add(point);

    createFragmentedIcosahedron();
    createParticleField();
    createMorphingCentral();
    createGlowSphere();
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
      const colors = [0x6366f1, 0x8b5cf6, 0xec4899, 0xa78bfa, 0x818cf8];
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
      new THREE.Color(0x6366f1),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0xec4899),
      new THREE.Color(0xa78bfa),
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
      color: 0x8b5cf6,
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
      color: 0x6366f1,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    glowMesh = new THREE.Mesh(geo, mat);
    glowMesh.position.set(15, 0, -8);
    scene.add(glowMesh);
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
      ? easeInOutCubic(Math.min(sec.progress * 1.5, 1))
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
  });

  window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    computeSectionOffsets();
  });

  // ── Init Everything ─────────────────────────────────────────
  initThree();
  computeSectionOffsets();
  initScrollReveal();
  initTimelineCards();
  initSkillsCards();
  initProjectTilt();
  animate();

  // Recompute on full load (images etc.)
  window.addEventListener('load', computeSectionOffsets);
})();
