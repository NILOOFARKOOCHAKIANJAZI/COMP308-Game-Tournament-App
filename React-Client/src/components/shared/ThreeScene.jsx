import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import Badge from 'react-bootstrap/Badge';

function ThreeScene({ status = 'inactive' }) {
  const mountRef = useRef(null);

  const statusConfig = useMemo(() => {
    switch (status) {
      case 'upcoming':
        return {
          color: 0x198754,
          speed: 0.02,
          label: 'Upcoming tournaments available',
          badgeBg: 'success'
        };
      case 'joined':
        return {
          color: 0xffc107,
          speed: 0.012,
          label: 'Joined tournaments in history',
          badgeBg: 'warning'
        };
      case 'inactive':
      default:
        return {
          color: 0xdc3545,
          speed: 0.006,
          label: 'No tournament activity yet',
          badgeBg: 'danger'
        };
    }
  }, [status]);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return undefined;

    const width = mountNode.clientWidth || 400;
    const height = 280;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountNode.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);

    const material = new THREE.MeshStandardMaterial({
      color: statusConfig.color,
      metalness: 0.5,
      roughness: 0.3
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const light = new THREE.PointLight(0xffffff, 1.2);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    let animationFrameId;

    const animate = () => {
      cube.rotation.x += statusConfig.speed;
      cube.rotation.y += statusConfig.speed;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const newWidth = mountNode.clientWidth || 400;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [statusConfig]);

  return (
    <div>
      <div
        ref={mountRef}
        style={{ width: '100%', minHeight: '280px' }}
        aria-hidden="true"
      />
      <div className="text-center mt-2">
        <Badge bg={statusConfig.badgeBg}>{statusConfig.label}</Badge>
      </div>
    </div>
  );
}

export default ThreeScene;