"use client";

import { useEffect, useRef } from "react";

const vertexShaderSource = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rotation * p * 1.92 + 13.7;
    amplitude *= 0.56;
  }

  return value;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = u_time * 0.045;

  vec2 warpA = vec2(
    fbm(p * 1.35 + vec2(t, -t * 0.55)),
    fbm(p * 1.35 + vec2(4.6 - t * 0.45, 2.2 + t * 0.7))
  );
  vec2 warpB = vec2(
    fbm(p * 1.8 + warpA * 1.7 + vec2(-t * 0.35, 6.1)),
    fbm(p * 1.8 + warpA * 1.5 + vec2(7.8, t * 0.5))
  );

  float field = fbm(p * 1.15 + warpA * 1.45 + warpB * 0.72);

  // Layered, slow sine swells instead of one sharp wave, so the current reads as
  // gentle drifting water rather than a single ripple band.
  float swellA = sin((p.x * 0.6 - p.y * 1.05 + field * 2.2 + t * 0.55) * 2.4);
  float swellB = sin((p.x * 1.15 + p.y * 0.5 + warpA.x * 1.6 - t * 0.4) * 1.7 + 1.7);
  float current = swellA * 0.65 + swellB * 0.35;
  float softCurrent = smoothstep(-1.0, 1.0, current);

  float deepWater = smoothstep(0.36, 0.86, field + warpB.x * 0.15);
  float freshWater = smoothstep(0.28, 0.8, warpA.y + softCurrent * 0.14);

  vec3 pale = vec3(0.961, 0.980, 0.988);
  vec3 mist = vec3(0.875, 0.965, 0.992);
  vec3 aqua = vec3(0.122, 0.639, 0.788);
  vec3 green = vec3(0.133, 0.773, 0.369);
  vec3 navy = vec3(0.043, 0.122, 0.227);

  vec3 color = mix(pale, mist, smoothstep(0.15, 0.9, field));
  color = mix(color, aqua, deepWater * 0.82);
  color = mix(color, navy, smoothstep(0.58, 0.98, field + softCurrent * 0.16) * 0.7);
  color = mix(color, green, freshWater * (1.0 - deepWater) * 0.32);

  float highlight = smoothstep(0.72, 1.0, warpB.y + softCurrent * 0.12);
  color = mix(color, vec3(1.0), highlight * 0.3);

  // Very fine, slow-shifting grain in place of a fast per-frame flicker keeps
  // the surface looking like still water catching light, not TV static.
  float grain = hash(gl_FragCoord.xy + floor(u_time * 6.0));
  color += (grain - 0.5) * 0.025;
  color = clamp(color, 0.0, 1.0);

  fragColor = vec4(color, 1.0);
}
`;

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function AquaWebGLBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      canvas.dataset.webgl = "unsupported";
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      canvas.dataset.webgl = "shader-error";
      return;
    }

    const program = gl.createProgram();

    if (!program) {
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.dataset.webgl = "link-error";
      gl.deleteProgram(program);
      return;
    }

    canvas.dataset.webgl = "active";

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let isVisible = true;
    let startTime = performance.now();

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      const width = Math.max(1, Math.round(bounds.width * pixelRatio));
      const height = Math.max(1, Math.round(bounds.height * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
    };

    const render = (now: number) => {
      resize();
      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, reducedMotionQuery.matches ? 0 : (now - startTime) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reducedMotionQuery.matches && isVisible && !document.hidden) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const start = () => {
      window.cancelAnimationFrame(animationFrame);
      startTime = performance.now();
      animationFrame = window.requestAnimationFrame(render);
    };

    const visibilityObserver =
      "IntersectionObserver" in window
        ? new IntersectionObserver(([entry]) => {
            isVisible = entry?.isIntersecting ?? false;

            if (isVisible && !document.hidden) {
              start();
            } else {
              window.cancelAnimationFrame(animationFrame);
            }
          })
        : null;

    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(() => resize()) : null;
    const handleVisibilityChange = () => {
      if (!document.hidden && isVisible) {
        start();
      } else {
        window.cancelAnimationFrame(animationFrame);
      }
    };
    const handleMotionChange = () => start();

    visibilityObserver?.observe(canvas);
    resizeObserver?.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery.addEventListener("change", handleMotionChange);
    resize();
    start();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener("change", handleMotionChange);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
