import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import '../styles/ThreeDChart.module.css';


const ThreeDChart = () => {
  const mountRef = useRef(null);
  const [hoveredValue, setHoveredValue] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f0f9ff');

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / 300,
      0.1,
      1000
    );
    camera.position.set(5, 7, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, 300);
    mount.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.target.set(2, 2, 0);
    controls.update();

    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Helpers
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Data bars group
    const data = [3, 6, 2, 5, 4];
    const barWidth = 0.8;
    const gap = 0.5;
    const barsGroup = new THREE.Group();

    const totalWidth = data.length * barWidth + (data.length - 1) * gap;

    // Create bars with initial height 0
    const bars = data.map((value, i) => {
      const geometry = new THREE.BoxGeometry(barWidth, 0.001, barWidth); // almost zero height to avoid zero scale issues
      const material = new THREE.MeshStandardMaterial({ color: '#0284c7' });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(
        i * (barWidth + gap) - totalWidth / 2 + barWidth / 2,
        0,
        0
      );
      barsGroup.add(bar);
      return { mesh: bar, targetHeight: value };
    });

    scene.add(barsGroup);

    // Raycaster and mouse vector for tooltip detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Animate bars height growth
    let animationProgress = 0;
    const animationDuration = 1000; // ms

    // Render and animate loop
    const animate = (time = 0) => {
      requestAnimationFrame(animate);

      // Animate bars height growing from 0 to targetHeight
      if (animationProgress < animationDuration) {
        animationProgress += 16; // approx 60fps

        const t = Math.min(animationProgress / animationDuration, 1);
        bars.forEach(({ mesh, targetHeight }) => {
          const currentHeight = targetHeight * t;
          mesh.scale.y = currentHeight;
          mesh.position.y = currentHeight / 2; // keep base at y=0
        });
      }

      barsGroup.rotation.y += 0.01; // slow rotation

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Mouse move handler for tooltip
    const onMouseMove = (event) => {
      const rect = mount.getBoundingClientRect();

      // Calculate mouse position in normalized device coordinates (-1 to +1)
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(barsGroup.children);

      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        const index = barsGroup.children.indexOf(intersected);
        if (index !== -1) {
          setHoveredValue(data[index]);
          setTooltipPos({ x: event.clientX, y: event.clientY });
          return;
        }
      }
      setHoveredValue(null);
    };

    mount.addEventListener('mousemove', onMouseMove);

    // Responsive resize
    const handleResize = () => {
      const width = mount.clientWidth;
      const height = 300;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousemove', onMouseMove);
      controls.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      style={{
        background: 'white',
        padding: '1rem',
        marginTop: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <h3 style={{ marginBottom: '1rem' }}>3D Chart View</h3>
      <div ref={mountRef} style={{ width: '100%', height: 300 }} />
      {/* Tooltip */}
      {hoveredValue !== null && (
        <div
          style={{
            position: 'fixed',
            top: tooltipPos.y + 10,
            left: tooltipPos.x + 10,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            pointerEvents: 'none',
            fontSize: '0.8rem',
            zIndex: 10,
            whiteSpace: 'nowrap',
            transform: 'translate(-50%, -50%)',
          }}
        >
          Value: {hoveredValue}
        </div>
      )}
    </div>
  );
};

export default ThreeDChart;
