"use client";

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";

function Model({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  const ref = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (reducedMotion) return;
    function onMove(e: MouseEvent) {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reducedMotion]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (!reducedMotion) {
      ref.current.rotation.y += delta * 0.18;
      ref.current.rotation.y += (target.current.x * 0.3 - ref.current.rotation.y * 0.02) * delta;
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        -target.current.y * 0.15,
        0.05
      );
    }
  });

  return (
    <group ref={ref} dispose={null}>
      <primitive object={scene} scale={1.4} position={[0, -1, 0]} />
    </group>
  );
}

function AdaptiveDpr() {
  const { gl } = useThree();
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    gl.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  }, [gl]);
  return null;
}

export function ProductScene({ src }: { src: string }) {
  const [ready, setReady] = useState(false);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 4.2], fov: 32 }}
      onCreated={() => setReady(true)}
      className={`transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <AdaptiveDpr />
      <ambientLight intensity={0.4} />
      <spotLight
        position={[3, 5, 4]}
        angle={0.35}
        penumbra={0.8}
        intensity={2.2}
        color="#ffffff"
        castShadow
      />
      <spotLight position={[-4, 2, -2]} angle={0.5} intensity={0.8} color="#9c1119" />
      <Suspense fallback={null}>
        <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
          <Model src={src} />
        </Float>
        <Environment preset="city" />
        <ContactShadows position={[0, -1.6, 0]} opacity={0.5} scale={8} blur={2.5} far={2} />
      </Suspense>
    </Canvas>
  );
}
