"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* ─────────────────── Three.js 3D Letter ─────────────────── */
function useThreeB(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 4);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 2.5);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa78bfa, 1.8);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0x7c3aed, 4, 12);
    pointLight.position.set(-2, 2, 3);
    scene.add(pointLight);

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.25,
      roughness: 0.18,
      envMapIntensity: 1.2,
    });

    const pmremGen = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGen.fromScene(new RoomEnvironment()).texture;
    scene.environment = envTexture;
    material.envMap   = envTexture;
    pmremGen.dispose();

    let mesh: THREE.Mesh | null = null;
    let animId: number;
    let angle = 0;

    (async () => {
      const fontJson = await import("three/examples/fonts/helvetiker_bold.typeface.json");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const font = new FontLoader().parse(fontJson.default as any);

      const geo = new TextGeometry("B", {
        font,
        size:           2.2,
        depth:          0.72,
        curveSegments:  32,
        bevelEnabled:   true,
        bevelThickness: 0.08,
        bevelSize:      0.045,
        bevelOffset:    0,
        bevelSegments:  14,
      });

      geo.computeBoundingBox();
      const box = geo.boundingBox!;
      geo.translate(
        -(box.max.x - box.min.x) / 2,
        -(box.max.y - box.min.y) / 2,
        -(box.max.z - box.min.z) / 2,
      );

      mesh = new THREE.Mesh(geo, material);
      mesh.castShadow = true;
      scene.add(mesh);

      const tick = () => {
        animId = requestAnimationFrame(tick);
        angle += 0.003;
        if (mesh) {
          mesh.rotation.y = angle;
          mesh.rotation.x = Math.sin(angle * 0.4) * 0.18;
        }
        pointLight.position.x = Math.sin(angle * 0.7) * 3;
        pointLight.position.y = Math.cos(angle * 0.5) * 2;
        renderer.render(scene, camera);
      };
      tick();
    })();

    const onResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      renderer.dispose();
      mesh?.geometry.dispose();
      (material as THREE.MeshStandardMaterial).dispose();
    };
  }, [canvasRef]);
}

/* ─────────────────── Brand Panel ─────────────────── */
function BrandPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useThreeB(canvasRef);

  return (
    <div style={{
      width: "100%", height: "100%",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(155deg, #06060f 0%, #0d0d1e 45%, #070712 100%)",
    }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(124,58,237,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.05) 1px,transparent 1px)",
        backgroundSize: "50px 50px",
      }} />
      {/* Glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 600, height: 600, borderRadius: "50%",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 68%)",
        pointerEvents: "none",
        animation: "bGlow 5s ease-in-out infinite",
      }} />

      {/* Canvas fills panel */}
      <div style={{ position: "relative", zIndex: 1, width: "min(500px, 80%)", aspectRatio: "1" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
          width={1000}
          height={1000}
        />
      </div>

      {/* Brand text */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginTop: 12 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px" }}>
          Biznesjon
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 7, lineHeight: 1.6 }}>
          Tadbirkorlar uchun professional platforma
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18 }}>
          {[0.6, 0.3, 0.15].map((op, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: `rgba(139,92,246,${op})` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Layout ─────────────────── */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const isRegister = Boolean(pathname?.includes("/register") || pathname?.includes("/verify-otp"));

  return (
    <>
      <style>{`
        @keyframes bGlow {
          0%,100% { opacity:0.18; transform:translate(-50%,-50%) scale(1); }
          50%      { opacity:0.32; transform:translate(-50%,-50%) scale(1.14); }
        }
        @media (max-width: 768px) {
          .auth-brand-half { display: none !important; }
          .auth-form-half  { flex: 0 0 100% !important; transform: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
        {/* Brand half */}
        <div
          className="auth-brand-half"
          style={{
            flex: "0 0 50%",
            minHeight: "100vh",
            transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
            transform: isRegister ? "translateX(100%)" : "translateX(0)",
          }}
        >
          <BrandPanel />
        </div>

        {/* Form half */}
        <div
          className="auth-form-half"
          style={{
            flex: "0 0 50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg)", padding: "40px 20px", minHeight: "100vh",
            transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
            transform: isRegister ? "translateX(-100%)" : "translateX(0)",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
