"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { CSSProperties } from "react";
import type * as THREE from "three";
import { formatLiters } from "./rainfallModelUtils";
import styles from "./Rainfall3DModel.module.css";

const cropPositions = Array.from({ length: 45 }, (_, index) => {
  const row = Math.floor(index / 9);
  const column = index % 9;

  return {
    x: -2.12 + column * 0.53 + (row % 2) * 0.07,
    z: -1.18 + row * 0.48,
    height: 0.34 + ((index * 5) % 7) * 0.028,
  };
});

const rainDropPositions = Array.from({ length: 56 }, (_, index) => ({
  x: -2.45 + ((index * 37) % 104) / 20,
  y: 1 + ((index * 19) % 58) / 30,
  z: -1.52 + ((index * 29) % 70) / 20,
}));

type Rainfall3DModelProps = {
  rainfallMm: number;
  rainfallLiters: number;
  rainIntensity: number;
  selectedDate: string;
  selectedPeriodLabel: string;
  style: CSSProperties;
};

function CornPlant3D({ crop }: { crop: (typeof cropPositions)[number] }) {
  return (
    <group position={[crop.x, 0.09, crop.z]}>
      <mesh position={[0, crop.height / 2, 0]} rotation={[0.1, 0, 0.04]}>
        <cylinderGeometry args={[0.012, 0.022, crop.height, 7]} />
        <meshStandardMaterial color="#4e9b35" roughness={0.78} />
      </mesh>
      <mesh position={[0.09, crop.height * 0.42, 0]} rotation={[0.1, 0.2, -0.82]}>
        <sphereGeometry args={[0.085, 12, 6]} />
        <meshStandardMaterial color="#6fba44" roughness={0.8} />
      </mesh>
      <mesh position={[-0.09, crop.height * 0.54, 0]} rotation={[0.1, -0.18, 0.86]}>
        <sphereGeometry args={[0.078, 12, 6]} />
        <meshStandardMaterial color="#7ac555" roughness={0.8} />
      </mesh>
      <mesh position={[0.08, crop.height * 0.76, 0.02]} rotation={[0.08, 0, -0.34]}>
        <capsuleGeometry args={[0.026, 0.15, 5, 8]} />
        <meshStandardMaterial color="#e8ca57" roughness={0.62} />
      </mesh>
      <mesh position={[0, crop.height + 0.06, 0]} rotation={[0.14, 0, -0.12]}>
        <coneGeometry args={[0.03, 0.16, 7]} />
        <meshStandardMaterial color="#e4cf5b" roughness={0.68} />
      </mesh>
    </group>
  );
}

function RootSystem3D({ crop, index }: { crop: (typeof cropPositions)[number]; index: number }) {
  const rootLength = 0.48 + ((index * 3) % 5) * 0.04;

  return (
    <group position={[crop.x, 0.02, crop.z]}>
      <mesh position={[0, -rootLength / 2, 0]}>
        <cylinderGeometry args={[0.006, 0.002, rootLength, 5]} />
        <meshStandardMaterial color="#dfcc8a" depthTest={false} roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.075, -rootLength * 0.44, 0.01]}
          rotation={[0, 0, side * 0.58]}
        >
          <cylinderGeometry args={[0.003, 0.001, 0.28, 5]} />
          <meshStandardMaterial color="#d8c580" depthTest={false} roughness={0.9} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={`lower-${side}`}
          position={[side * 0.05, -rootLength * 0.7, -0.015]}
          rotation={[0, 0, side * 0.92]}
        >
          <cylinderGeometry args={[0.0025, 0.001, 0.22, 5]} />
          <meshStandardMaterial color="#cab87a" depthTest={false} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function RainfallField3D({ rainfallMm, rainIntensity }: { rainfallMm: number; rainIntensity: number }) {
  const rainGroupRef = useRef<THREE.Group>(null);
  const waterDepth = rainfallMm > 0 ? 0.018 + rainIntensity * 0.24 : 0.003;
  const moistureDepth = rainfallMm > 0 ? 0.16 + rainIntensity * 0.5 : 0.02;
  const soilHeight = 1.18;
  const fieldWidth = 5.2;
  const fieldDepth = 3.2;

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (rainGroupRef.current) {
      rainGroupRef.current.position.y = -((elapsed * 0.75) % 0.72);
    }
  });

  return (
    <group position={[0, -0.58, 0]}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2.8, 4.2, 3]} intensity={1.9} />
      <mesh position={[0, -soilHeight + 0.2, 0]}>
        <boxGeometry args={[fieldWidth, 0.4, fieldDepth]} />
        <meshStandardMaterial color="#514b28" opacity={0.88} transparent roughness={0.96} />
      </mesh>
      <mesh position={[0, -0.68, 0]}>
        <boxGeometry args={[fieldWidth, 0.5, fieldDepth]} />
        <meshStandardMaterial color="#6f6533" opacity={0.82} transparent roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.23, 0]}>
        <boxGeometry args={[fieldWidth, 0.42, fieldDepth]} />
        <meshStandardMaterial color="#81783f" opacity={0.78} transparent roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[fieldWidth, 0.08, fieldDepth]} />
        <meshStandardMaterial color="#91c544" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.08 + waterDepth / 2, 0]}>
        <boxGeometry args={[fieldWidth + 0.02, waterDepth, fieldDepth + 0.02]} />
        <meshStandardMaterial
          color="#86d9ff"
          opacity={0.46}
          transparent
          roughness={0.14}
          metalness={0.04}
        />
      </mesh>
      <mesh position={[0, 0.092 + waterDepth, 0]}>
        <boxGeometry args={[fieldWidth + 0.04, 0.012, fieldDepth + 0.04]} />
        <meshStandardMaterial color="#d1f7ff" opacity={0.74} transparent roughness={0.12} />
      </mesh>
      <mesh position={[0, -0.98 + moistureDepth / 2, 0]}>
        <boxGeometry args={[fieldWidth + 0.01, moistureDepth, fieldDepth + 0.01]} />
        <meshStandardMaterial
          color="#56a7d4"
          opacity={0.18 + rainIntensity * 0.22}
          transparent
          roughness={0.4}
        />
      </mesh>
      {cropPositions.map((crop, index) => (
        <RootSystem3D key={`roots-${crop.x}-${crop.z}`} crop={crop} index={index} />
      ))}
      {Array.from({ length: 9 }).map((_, index) => (
        <RootSystem3D
          key={`front-roots-${index}`}
          crop={{
            x: -2.12 + index * 0.53,
            z: fieldDepth / 2 + 0.04,
            height: 0.38,
          }}
          index={index + 20}
        />
      ))}
      {cropPositions.map((crop) => (
        <CornPlant3D key={`crop-${crop.x}-${crop.z}`} crop={crop} />
      ))}
      <group ref={rainGroupRef}>
        {rainfallMm > 0 && rainDropPositions.map((drop, index) => (
          <mesh key={`${drop.x}-${drop.y}-${drop.z}-${index}`} position={[drop.x, drop.y + 0.55, drop.z]} rotation={[0.5, 0, -0.22]}>
            <cylinderGeometry args={[0.005, 0.005, 0.32, 5]} />
            <meshBasicMaterial color="#63bff0" transparent opacity={0.2 + rainIntensity * 0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Rainfall3DModel({
  rainfallMm,
  rainfallLiters,
  rainIntensity,
  selectedDate,
  selectedPeriodLabel,
  style,
}: Rainfall3DModelProps) {
  return (
    <div
      className={styles.field3d}
      style={style}
      aria-label={`3D crop field model showing ${rainfallMm} millimeters of accumulated rainfall equivalent on ${selectedPeriodLabel}.`}
    >
      <Canvas
        camera={{ position: [0, 2.1, 5.8], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <RainfallField3D rainfallMm={rainfallMm} rainIntensity={rainIntensity} />
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          enablePan
          minDistance={3.2}
          maxDistance={7}
          maxPolarAngle={Math.PI / 2.15}
          target={[0, -0.34, 0]}
        />
      </Canvas>
      <div className={styles.depthBadge} aria-hidden="true">
        <strong>Rainfall equivalent: {rainfallMm} mm</strong>
        <span>drag to rotate; blue sheet = rainfall-depth equivalent</span>
      </div>
      <div className={styles.volumeBadge} aria-hidden="true">
        {formatLiters(rainfallLiters)} L across 1 ha on {selectedDate}
      </div>
    </div>
  );
}
