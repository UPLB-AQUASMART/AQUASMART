"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  makeSceneScaler,
  buildSurfaceGeometry,
  WELL_PRESENTATION,
} from "@/app/about/groundwaterGeometry";

function Terrain({ data, toScenePoint }) {
  const geometry = useMemo(
    () =>
      buildSurfaceGeometry(data.terrain, toScenePoint, {
        terrainColors: true,
        domain: data.domain,
      }),
    [data, toScenePoint],
  );
  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0} />
    </mesh>
  );
}

/** The colored "cake layer" side walls that make the cutaway look. */
function CutawayFaces({ data, toScenePoint }) {
  const geometries = useMemo(
    () =>
      data.cutawayFaces.map((face) => buildSurfaceGeometry(face, toScenePoint)),
    [data, toScenePoint],
  );
  return (
    <group>
      {data.cutawayFaces.map((face, i) => (
        <mesh
          key={`${face.name}-${i}`}
          geometry={geometries[i]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={face.color}
            roughness={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function Base({ data, toScenePoint }) {
  const geometry = useMemo(
    () => buildSurfaceGeometry(data.base, toScenePoint),
    [data, toScenePoint],
  );
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color={data.base.color} roughness={1} />
    </mesh>
  );
}

function WellMarker({ well, toScenePoint, active, onHover }) {
  const top = toScenePoint([well.x_m, well.y_m, well.screen_top_m]);
  const bottom = toScenePoint([well.x_m, well.y_m, well.screen_bottom_m]);
  const label = WELL_PRESENTATION[well.id]?.name || well.id;
  const isPumping = well.role === "Pumping";

  return (
    <group>
      <Line
        points={[top, bottom]}
        color="#ffffff"
        lineWidth={1}
        dashed
        dashSize={0.09}
        gapSize={0.07}
        transparent
        opacity={0.85}
      />

      <mesh
        position={top}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(well.id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
      >
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color={active ? "#4ade80" : isPumping ? "#0057ff" : "#f8fafc"}
          emissive={active ? "#4ade80" : "#000000"}
          emissiveIntensity={active ? 0.45 : 0}
        />
      </mesh>

      <Html
        position={[top.x, top.y + 0.55, top.z]}
        center
        distanceFactor={16}
        occlude
      >
        <div
          style={{
            background: active ? "#4ade80" : "rgba(15, 37, 64, 0.92)",
            color: active ? "#0f2540" : "#ffffff",
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            padding: "4px 9px",
            borderRadius: "999px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            letterSpacing: "0.01em",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function Scene({ data }) {
  const [hovered, setHovered] = useState(null);
  const toScenePoint = useMemo(() => makeSceneScaler(data.domain), [data]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[24, 30, 16]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-18, 12, -12]} intensity={0.3} />

      <Terrain data={data} toScenePoint={toScenePoint} />
      <CutawayFaces data={data} toScenePoint={toScenePoint} />
      <Base data={data} toScenePoint={toScenePoint} />

      {data.wells.map((well) => (
        <WellMarker
          key={well.id}
          well={well}
          toScenePoint={toScenePoint}
          active={hovered === well.id}
          onHover={setHovered}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={28}
        maxDistance={85}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate
        autoRotateSpeed={0.6}
        target={[0, -1.35, 0]}
      />
    </>
  );
}

function CenteredMessage({ children }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9aa3af",
        fontSize: "13px",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {children}
    </div>
  );
}

export default function GroundwaterModel({
  dataUrl = "/data/demo_groundwater_scene.json",
  className = "",
}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [dataUrl]);

  if (error) {
    return (
      <div className={className} style={{ width: "100%", height: "100%" }}>
        <CenteredMessage>Could not load model data.</CenteredMessage>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={className} style={{ width: "100%", height: "100%" }}>
        <CenteredMessage>Loading model…</CenteredMessage>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        shadows
        camera={{ position: [46, 24, 42], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#eaf3fb"]} />
        <Scene data={data} />
      </Canvas>
    </div>
  );
}
