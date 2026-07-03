"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { makeSceneScaler, buildSurfaceGeometry, WELL_PRESENTATION } from "./groundwaterGeometry";

function Terrain({ data, toScenePoint }) {
  const geometry = useMemo(
    () =>
      buildSurfaceGeometry(data.terrain, toScenePoint, {
        terrainColors: true,
        domain: data.domain,
      }),
    [data, toScenePoint]
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
    () => data.cutawayFaces.map((face) => buildSurfaceGeometry(face, toScenePoint)),
    [data, toScenePoint]
  );
  return (
    <group>
      {data.cutawayFaces.map((face, i) => (
        <mesh key={`${face.name}-${i}`} geometry={geometries[i]} castShadow receiveShadow>
          <meshStandardMaterial color={face.color} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Base({ data, toScenePoint }) {
  const geometry = useMemo(
    () => buildSurfaceGeometry(data.base, toScenePoint),
    [data, toScenePoint]
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

      <Html position={[top.x, top.y + 0.55, top.z]} center distanceFactor={16} occlude>
        <div
          style={{
            background: active ? "#4ade80" : "rgba(15, 37, 64, 0.92)",
            color: active ? "#0f2540" : "#ffffff",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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

const CAMERA_POSITION = new THREE.Vector3(44, 9, 34);
const CAMERA_DISTANCE = CAMERA_POSITION.length();
const CAMERA_FOV = 45;
const CAMERA_SPHERICAL = new THREE.Spherical().setFromVector3(CAMERA_POSITION);
const ROTATE_WINDOW = THREE.MathUtils.degToRad(35);
const TILT_WINDOW = THREE.MathUtils.degToRad(15);

const AZIMUTH_MIN = CAMERA_SPHERICAL.theta - ROTATE_WINDOW;
const AZIMUTH_MAX = CAMERA_SPHERICAL.theta + ROTATE_WINDOW;
const SWAY_SPEED = 0.12; // radians / second
const SWAY_RESUME_DELAY = 1500; // ms after the user lets go before swaying resumes

/** Gently oscillates the camera back and forth within the allowed azimuth
 * window when idle, and pauses politely while the user is dragging. */
function AutoSway({ orbitRef }) {
  const pausedRef = useRef(false);
  const resumeTimeout = useRef(null);
  const direction = useRef(1);

  useEffect(() => {
    const controls = orbitRef.current;
    if (!controls) return undefined;

    const handleStart = () => {
      pausedRef.current = true;
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };
    const handleEnd = () => {
      resumeTimeout.current = setTimeout(() => {
        pausedRef.current = false;
      }, SWAY_RESUME_DELAY);
    };

    controls.addEventListener("start", handleStart);
    controls.addEventListener("end", handleEnd);
    return () => {
      controls.removeEventListener("start", handleStart);
      controls.removeEventListener("end", handleEnd);
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };
  }, [orbitRef]);

  useFrame((_, delta) => {
    const controls = orbitRef.current;
    if (!controls || pausedRef.current) return;

    const camera = controls.object;
    const target = controls.target;
    const offset = camera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    let theta = spherical.theta + direction.current * SWAY_SPEED * delta;
    if (theta >= AZIMUTH_MAX) {
      theta = AZIMUTH_MAX;
      direction.current = -1;
    } else if (theta <= AZIMUTH_MIN) {
      theta = AZIMUTH_MIN;
      direction.current = 1;
    }

    spherical.theta = theta;
    offset.setFromSpherical(spherical);
    camera.position.copy(target).add(offset);
    camera.lookAt(target);
    controls.update();
  });

  return null;
}

function Scene({ data }) {
  const [hovered, setHovered] = useState(null);
  const toScenePoint = useMemo(() => makeSceneScaler(data.domain), [data]);
  const orbitRef = useRef();

  return (
    <>
      <AutoSway orbitRef={orbitRef} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[24, 30, 16]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
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
        ref={orbitRef}
        makeDefault
        enablePan={false}
        enableZoom={true}
        minDistance={CAMERA_DISTANCE}
        maxDistance={CAMERA_DISTANCE * 1.5}
        minPolarAngle={CAMERA_SPHERICAL.phi - TILT_WINDOW}
        maxPolarAngle={Math.min(CAMERA_SPHERICAL.phi + TILT_WINDOW, Math.PI / 2.05)}
        minAzimuthAngle={AZIMUTH_MIN}
        maxAzimuthAngle={AZIMUTH_MAX}
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
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
        camera={{ position: CAMERA_POSITION.toArray(), fov: CAMERA_FOV }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene data={data} />
      </Canvas>
    </div>
  );
}
