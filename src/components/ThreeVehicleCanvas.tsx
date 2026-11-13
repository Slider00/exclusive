"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Sparkles, Droplets, RotateCw, Eye, Loader2, Wind, Waves } from "lucide-react";

export type VehicleType = "carro" | "camioneta" | "moto";

interface ThreeVehicleCanvasProps {
  vehicleType?: VehicleType;
  onVehicleChange?: (type: VehicleType) => void;
}

export default function ThreeVehicleCanvas({
  vehicleType = "carro",
  onVehicleChange,
}: ThreeVehicleCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentType, setCurrentType] = useState<VehicleType>(vehicleType);
  const [carColor, setCarColor] = useState<string>("#00f0ff");
  const [sprayMode, setSprayMode] = useState<"water" | "foam">("foam");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);

  // References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const washerPersonRef = useRef<THREE.Group | null>(null);
  const gunNozzleRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const sprayParticlesRef = useRef<{
    points: THREE.Points;
    velocities: Float32Array;
    lifetimes: Float32Array;
  } | null>(null);
  const splashParticlesRef = useRef<{
    points: THREE.Points;
    velocities: Float32Array;
  } | null>(null);
  const bodyMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);

  useEffect(() => {
    setCurrentType(vehicleType);
  }, [vehicleType]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. ESCENA & FONDO DE CABINA ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x070b13);
    scene.fog = new THREE.FogExp2(0x070b13, 0.04);

    // --- 2. CÁMARA CENTRADA EN VEHÍCULO Y LAVADOR ---
    const getBoxSize = () => {
      const rect = container.getBoundingClientRect();
      const parentRect = container.parentElement?.getBoundingClientRect();
      const w = Math.floor(rect.width || parentRect?.width || container.clientWidth || 600);
      const h = Math.floor(rect.height || parentRect?.height || container.clientHeight || 560);
      return { w: Math.max(w, 320), h: Math.max(h, 500) };
    };

    const { w: width, h: height } = getBoxSize();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.4, 1.6, 3.8);

    // --- 3. RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // Estilo al canvas
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // --- 4. ILUMINACIÓN PROFESIONAL DE CABINA DE LAVADO ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Luz cenital principal
    const overheadWashLight = new THREE.DirectionalLight(0xffffff, 3.0);
    overheadWashLight.position.set(0, 7, 1.5);
    overheadWashLight.castShadow = true;
    overheadWashLight.shadow.mapSize.width = 2048;
    overheadWashLight.shadow.mapSize.height = 2048;
    overheadWashLight.shadow.bias = -0.0001;
    scene.add(overheadWashLight);

    // Luces neón laterales de túnel de lavado
    const cyanLight = new THREE.PointLight(0x00f0ff, 4.5, 12);
    cyanLight.position.set(-3.5, 2.2, 2.5);
    scene.add(cyanLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 4.5, 12);
    blueLight.position.set(3.5, 2.2, -2.5);
    scene.add(blueLight);

    // Foco de iluminación sobre la persona lavando
    const workerSpot = new THREE.SpotLight(0xffffff, 4.0, 14, Math.PI / 3.5, 0.3);
    workerSpot.position.set(2.5, 4.5, 3.5);
    scene.add(workerSpot);

    // --- 5. CABINA DE LAVADO INDUSTRIAL (WASH BAY) ---
    const washBayGroup = new THREE.Group();

    // Suelo infinito mojado con reflejos
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090e17,
      roughness: 0.12,
      metalness: 0.85,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    washBayGroup.add(floor);

    // Rejilla de desagüe central metálica
    const grateGeo = new THREE.PlaneGeometry(5, 8.5);
    const grateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.9,
      wireframe: true,
    });
    const drainGrate = new THREE.Mesh(grateGeo, grateMat);
    drainGrate.rotation.x = -Math.PI / 2;
    drainGrate.position.set(0, 0.005, 0);
    washBayGroup.add(drainGrate);

    // Pared trasera de la cabina (baldosas de detailing oscuras)
    const backWallGeo = new THREE.BoxGeometry(14, 5.5, 0.2);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x080c14,
      roughness: 0.3,
      metalness: 0.4,
    });
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 2.75, -5.5);
    washBayGroup.add(backWall);

    // Columnas y Arco de túnel de lavado
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.8,
    });

    const colLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 0.3), archMat);
    colLeft.position.set(-4.2, 2.5, -0.5);
    const colRight = colLeft.clone();
    colRight.position.x = 4.2;

    const archTop = new THREE.Mesh(new THREE.BoxGeometry(8.7, 0.3, 0.3), archMat);
    archTop.position.set(0, 5, -0.5);

    washBayGroup.add(colLeft, colRight, archTop);

    // Tiras LED en las columnas del arco
    const ledNeonMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const ledLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.2, 0.08), ledNeonMat);
    ledLeft.position.set(-4.0, 2.4, -0.45);
    const ledRight = ledLeft.clone();
    ledRight.position.x = 4.0;
    washBayGroup.add(ledLeft, ledRight);

    // Paneles LED hexagonales en el techo
    const ceilingHexagons = new THREE.Group();
    const hexRadius = 0.65;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const hexGeo = new THREE.RingGeometry(hexRadius * 0.9, hexRadius, 6);
        const hexMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
        });
        const hexMesh = new THREE.Mesh(hexGeo, hexMat);
        hexMesh.rotation.x = Math.PI / 2;
        hexMesh.position.set(c * 1.35, 4.8, r * 1.35);
        ceilingHexagons.add(hexMesh);
      }
    }
    washBayGroup.add(ceilingHexagons);

    // Máquina Hidrolavadora Industrial (Kärcher Station)
    const washerMachine = new THREE.Group();
    const machineBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.95, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.2 }) // Amarillo Kärcher
    );
    machineBody.position.set(0, 0.55, 0);

    const machineBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.15, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 })
    );
    machineBase.position.set(0, 0.1, 0);

    // Ruedas de la hidrolavadora
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
    const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), wheelMat);
    w1.rotation.z = Math.PI / 2;
    w1.position.set(0.35, 0.12, 0.2);
    const w2 = w1.clone();
    w2.position.z = -0.2;

    // Manillar / Carretel de manguera
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.8 })
    );
    handle.position.set(0, 1.15, -0.2);
    handle.rotation.z = Math.PI / 2;

    washerMachine.add(machineBody, machineBase, w1, w2, handle);
    washerMachine.position.set(2.3, 0, 1.7);
    washerMachine.rotation.y = -Math.PI / 4;
    washBayGroup.add(washerMachine);

    scene.add(washBayGroup);

    // --- 6. MODELO DE LA PERSONA LAVANDO EL VEHÍCULO (DETAILER EXPERT) ---
    const personGroup = new THREE.Group();
    washerPersonRef.current = personGroup;

    // Materiales del uniforme del lavador
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0a899, roughness: 0.6 });
    const uniformMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 }); // Uniforme azul marino oscuro
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.1 }); // Delantal impermeable azul
    const bootsMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 }); // Botas impermeables
    const glovesMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 }); // Guantes de nitrilo cyan
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.2 }); // Lanza de hidrolavadora

    // Cabeza con gorra de detailing
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), skinMat);
    head.position.set(0, 1.62, 0);

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16),
      uniformMat
    );
    cap.position.set(0, 1.7, 0);
    const capVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.02, 0.1),
      uniformMat
    );
    capVisor.position.set(0, 1.68, -0.12);

    // Torso con delantal
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.65, 16), uniformMat);
    torso.position.set(0, 1.18, 0);

    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.6, 0.1), apronMat);
    apron.position.set(0, 1.15, -0.16);

    // Piernas y botas
    const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 12), uniformMat);
    legLeft.position.set(-0.13, 0.6, 0);
    const legRight = legLeft.clone();
    legRight.position.x = 0.13;

    const bootLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.22), bootsMat);
    bootLeft.position.set(-0.13, 0.1, -0.04);
    const bootRight = bootLeft.clone();
    bootRight.position.x = 0.13;

    // Brazos sosteniendo la pistola hidrolavadora
    const armLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12), uniformMat);
    armLeft.position.set(-0.25, 1.18, -0.22);
    armLeft.rotation.x = Math.PI / 3;
    armLeft.rotation.z = -0.2;

    const armRight = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12), uniformMat);
    armRight.position.set(0.22, 1.18, -0.2);
    armRight.rotation.x = Math.PI / 3;
    armRight.rotation.z = 0.2;

    // Guantes
    const handLeft = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), glovesMat);
    handLeft.position.set(-0.2, 1.05, -0.45);

    const handRight = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), glovesMat);
    handRight.position.set(0.15, 1.05, -0.42);

    // Pistola / Lanza de lavado con boquilla
    const washGunGroup = new THREE.Group();
    const gunHandle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.08), gunMat);
    gunHandle.rotation.x = 0.3;

    // Cañón largo de acero inoxidable
    const lanceBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.75, 12),
      new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.95, roughness: 0.1 })
    );
    lanceBar.rotation.x = Math.PI / 2;
    lanceBar.position.set(0, 0.08, -0.38);

    // Boquilla / Cañón de espuma
    const foamNozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.025, 0.12, 12),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    foamNozzle.rotation.x = Math.PI / 2;
    foamNozzle.position.set(0, 0.08, -0.78);

    washGunGroup.add(gunHandle, lanceBar, foamNozzle);
    washGunGroup.position.set(0, 1.05, -0.4);

    personGroup.add(
      head,
      cap,
      capVisor,
      torso,
      apron,
      legLeft,
      legRight,
      bootLeft,
      bootRight,
      armLeft,
      armRight,
      handLeft,
      handRight,
      washGunGroup
    );

    // Posicionar al lavador cerca del vehículo apuntando con la lanza
    personGroup.position.set(1.4, 0, 1.05);
    personGroup.rotation.y = -Math.PI / 3.4; // Mirando hacia el vehículo
    scene.add(personGroup);

    // --- 7. SISTEMA DE PARTÍCULAS: CHORRO DE AGUA / ESPUMA ACTIVA DESDE LA LANZA ---
    setupSpraySystem(scene);

    // --- 8. GRUPO CONTENEDOR DEL VEHÍCULO ---
    const vehicleGroup = new THREE.Group();
    vehicleGroupRef.current = vehicleGroup;
    scene.add(vehicleGroup);

    // Cargar modelo real
    loadRealVehicleModel(currentType, carColor, vehicleGroup);

    // --- 9. INTERACCIÓN DE ROTACIÓN 360° ---
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0.5;
    let targetRotationX = 0.14;
    let currentRotationY = 0.5;
    let currentRotationX = 0.14;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;
      prevMouseX = clientX;
      prevMouseY = clientY;

      targetRotationY += deltaX * 0.007;
      targetRotationX = Math.max(0.04, Math.min(0.45, targetRotationX + deltaY * 0.005));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    domEl.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // --- 10. ANIMATION LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Rotación suave de órbita
      if (autoRotate && !isDragging) {
        targetRotationY += 0.004;
      }
      currentRotationY += (targetRotationY - currentRotationY) * 0.1;
      currentRotationX += (targetRotationX - currentRotationX) * 0.1;

      const distance = 4.2;
      camera.position.x = Math.sin(currentRotationY) * distance * Math.cos(currentRotationX);
      camera.position.z = Math.cos(currentRotationY) * distance * Math.cos(currentRotationX);
      camera.position.y = 1.1 + Math.sin(currentRotationX) * distance * 0.5;
      camera.lookAt(0.3, 0.65, 0.15);

      // Animación activa del lavador: balancea suavemente la lanza cubriendo el vehículo
      if (washerPersonRef.current) {
        const panAngle = Math.sin(elapsedTime * 2.2) * 0.12;
        washerPersonRef.current.rotation.y = -Math.PI / 3.4 + panAngle;

        const tiltAngle = Math.sin(elapsedTime * 3) * 0.03;
        washerPersonRef.current.position.y = Math.abs(tiltAngle * 0.5);
      }

      // Animación del chorro de la hidrolavadora / espuma activa
      updateSprayParticles(elapsedTime, delta);

      // Suave parpadeo de neones de cabina
      cyanLight.intensity = 3.6 + Math.sin(elapsedTime * 3) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      domEl.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      renderer.dispose();
    };
  }, []);

  // Recargar vehículo cuando cambia tipo
  useEffect(() => {
    if (!vehicleGroupRef.current) return;
    loadRealVehicleModel(currentType, carColor, vehicleGroupRef.current);
  }, [currentType]);

  // Actualizar color de carrocería en tiempo real
  useEffect(() => {
    bodyMaterialsRef.current.forEach((mat) => {
      mat.color.set(carColor);
    });
  }, [carColor]);

  // Sistema de partículas de hidrolavado
  const setupSpraySystem = (scene: THREE.Scene) => {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Iniciar en la punta de la boquilla del lavador
      positions[i * 3] = 1.3;
      positions[i * 3 + 1] = 1.15;
      positions[i * 3 + 2] = 0.8;

      lifetimes[i] = Math.random();
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const sprayMat = new THREE.PointsMaterial({
      color: sprayMode === "foam" ? 0xffffff : 0x00f0ff,
      size: sprayMode === "foam" ? 0.08 : 0.04,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, sprayMat);
    scene.add(points);

    sprayParticlesRef.current = {
      points,
      velocities,
      lifetimes,
    };
  };

  // Actualizar física del chorro de agua/espuma hacia el carro
  const updateSprayParticles = (elapsedTime: number, delta: number) => {
    if (!sprayParticlesRef.current || !washerPersonRef.current) return;

    const { points, lifetimes } = sprayParticlesRef.current;
    const positions = points.geometry.attributes.position.array as Float32Array;

    // Calcular posición de la boquilla en coordenadas globales
    const nozzleX = 1.05 + Math.sin(elapsedTime * 2.2) * 0.1;
    const nozzleY = 1.08;
    const nozzleZ = 0.65;

    // Dirección hacia la carrocería del vehículo
    const targetX = (Math.sin(elapsedTime * 2.2) - 0.2) * 0.6;
    const targetY = 0.52 + Math.cos(elapsedTime * 2.5) * 0.15;
    const targetZ = 0.05;

    for (let i = 0; i < lifetimes.length; i++) {
      lifetimes[i] += delta * 2.2;

      if (lifetimes[i] > 1.0) {
        lifetimes[i] = 0;
        positions[i * 3] = nozzleX;
        positions[i * 3 + 1] = nozzleY;
        positions[i * 3 + 2] = nozzleZ;
      } else {
        const progress = lifetimes[i];
        // Trayectoria parabólica hacia el vehículo
        positions[i * 3] = THREE.MathUtils.lerp(nozzleX, targetX, progress) + (Math.random() - 0.5) * 0.08 * progress;
        positions[i * 3 + 1] = THREE.MathUtils.lerp(nozzleY, targetY, progress) - progress * progress * 0.35;
        positions[i * 3 + 2] = THREE.MathUtils.lerp(nozzleZ, targetZ, progress) + (Math.random() - 0.5) * 0.08 * progress;
      }
    }

    // Actualizar color/tamaño según sprayMode
    const mat = points.material as THREE.PointsMaterial;
    mat.color.set(sprayMode === "foam" ? 0xffffff : 0x00f0ff);
    mat.size = sprayMode === "foam" ? 0.075 : 0.04;

    points.geometry.attributes.position.needsUpdate = true;
  };

  // Carga del modelo real dentro de la cabina
  const loadRealVehicleModel = (type: VehicleType, colorHex: string, parent: THREE.Group) => {
    setIsLoadingModel(true);

    while (parent.children.length > 0) {
      parent.remove(parent.children[0]);
    }
    bodyMaterialsRef.current = [];

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const modelPathMap: Record<VehicleType, string> = {
      carro: "/models/carro.glb",
      camioneta: "/models/porsche.glb",
      moto: "/models/moto.glb",
    };

    const targetUrl = modelPathMap[type];

    // Pintura automotriz reflectiva
    const bodyPaintMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.9,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95,
    });
    bodyMaterialsRef.current.push(bodyPaintMat);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x050c18,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.8,
      transparent: true,
      opacity: 0.9,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.08,
    });

    gltfLoader.load(
      targetUrl,
      (gltf) => {
        const root = gltf.scene;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const name = (mesh.name || "").toLowerCase();
            const matName = Array.isArray(mesh.material)
              ? mesh.material.map((m) => m.name.toLowerCase()).join(" ")
              : (mesh.material?.name || "").toLowerCase();

            const isBody =
              name.includes("body") ||
              name.includes("car") ||
              matName.includes("body") ||
              matName.includes("plast_red") ||
              matName.includes("paint") ||
              name.includes("trim");

            const isGlass =
              name.includes("glass") ||
              matName.includes("glass") ||
              name.includes("windshield");

            const isChrome =
              name.includes("chrome") ||
              matName.includes("chrome") ||
              name.includes("metal") ||
              name.includes("grill");

            if (isBody) {
              mesh.material = bodyPaintMat;
            } else if (isGlass) {
              mesh.material = glassMat;
            } else if (isChrome) {
              mesh.material = chromeMat;
            }
          }
        });

        // Normalizar proporciones
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetDim = type === "moto" ? 2.6 : 3.6;
        const scale = targetDim / maxDim;

        root.scale.setScalar(scale);

        // Centrado exacto sobre la rejilla del piso
        root.position.x = -center.x * scale;
        root.position.y = -box.min.y * scale + 0.02;
        root.position.z = -center.z * scale;

        parent.add(root);

        // Neón bajo el chasis
        const underglow = new THREE.PointLight(new THREE.Color(colorHex), 3.5, 3.5);
        underglow.position.set(0, 0.2, 0);
        parent.add(underglow);

        setIsLoadingModel(false);
      },
      undefined,
      (err) => {
        console.error("Error loading vehicle:", err);
        setIsLoadingModel(false);
      }
    );
  };

  const handleTypeSelect = (type: VehicleType) => {
    setCurrentType(type);
    if (onVehicleChange) onVehicleChange(type);
  };

  const colors = [
    { label: "Cyan Neón", hex: "#00f0ff" },
    { label: "Negro Obsidiana", hex: "#161b22" },
    { label: "Rojo Ferrari", hex: "#ef4444" },
    { label: "Blanco Perla", hex: "#f8fafc" },
    { label: "Oro Champán", hex: "#f59e0b" },
    { label: "Azul Cobalto", hex: "#2563eb" },
  ];

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-white/10 glass-panel shadow-2xl flex flex-col justify-between"
      style={{ minHeight: "560px", height: "560px" }}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-950/60 to-transparent pointer-events-none" />

      {/* Top Header Bar with Vehicle Selector Tabs */}
      <div className="relative z-10 flex flex-wrap items-center justify-between p-4 md:p-6 gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
          <button
            onClick={() => handleTypeSelect("carro")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all ${
              currentType === "carro"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🏎️ Automóvil
          </button>
          <button
            onClick={() => handleTypeSelect("camioneta")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all ${
              currentType === "camioneta"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🚙 Camioneta
          </button>
          <button
            onClick={() => handleTypeSelect("moto")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all ${
              currentType === "moto"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🏍️ Motocicleta
          </button>
        </div>

        {/* Studio Badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/50 px-3.5 py-1.5 rounded-full border border-cyan-500/30 shadow-lg">
          <Waves className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>Cabina Activa de Lavado 3D</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoadingModel && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none animate-in fade-in">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs font-semibold shadow-xl">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Ingresando vehículo a la cabina...</span>
          </div>
        </div>
      )}

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full"
        title="Arrastra con el mouse para rotar la cabina 360°"
      />

      {/* Bottom Controls Bar */}
      <div className="relative z-10 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent">
        {/* Paint Color Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Pintura:</span>
          <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-full border border-white/10">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => setCarColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`w-5 h-5 rounded-full transition-transform ${
                  carColor === c.hex ? "scale-125 ring-2 ring-cyan-400" : "hover:scale-110 opacity-80"
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Spray Mode Toggle & Auto Rotation */}
        <div className="flex items-center gap-2">
          {/* Alternador de Hidrolavadora: Agua vs Espuma */}
          <button
            onClick={() => setSprayMode(sprayMode === "foam" ? "water" : "foam")}
            className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            title="Cambiar boquilla de hidrolavadora"
          >
            {sprayMode === "foam" ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white animate-spin" style={{ animationDuration: "6s" }} />
                <span className="text-white font-bold">Espuma Nieve Activa</span>
              </>
            ) : (
              <>
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-400 font-bold">Agua a Presión</span>
              </>
            )}
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              autoRotate
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
            }`}
            title="Pausar o reanudar rotación automática"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "8s" }} />
            <span className="hidden sm:inline">Giro 360°</span>
          </button>
        </div>
      </div>
    </div>
  );
}
