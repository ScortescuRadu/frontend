import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane, PerspectiveCamera } from '@react-three/drei';
import { IconButton, Box } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import * as THREE from 'three';

const HoverEffect = ({ setHoveredTile }) => {
  const planeRef = useRef();

  useFrame(({ mouse, camera, scene }) => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planeRef.current);

    if (intersects.length > 0) {
      const { x, z } = intersects[0].point;
      setHoveredTile({ x: Math.floor(x) + 0.5, z: Math.floor(z) + 0.5 });
    } else {
      setHoveredTile(null);
    }
  });

  return (
    <Plane
      ref={planeRef}
      args={[20, 20]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      visible={false}>
      <meshBasicMaterial attach="material" side={THREE.DoubleSide} />
    </Plane>
  );
};

const ParkingLot3D = () => {
  const controlRef = useRef();
  const [hoveredTile, setHoveredTile] = useState(null);

  const zoomIn = () => {
    const controls = controlRef.current;
    if (controls && controls.object) {
      const camera = controls.object;
      camera.zoom *= 1.1;
      camera.updateProjectionMatrix();
    }
  };

  const zoomOut = () => {
    const controls = controlRef.current;
    if (controls && controls.object) {
      const camera = controls.object;
      camera.zoom /= 1.1;
      camera.updateProjectionMatrix();
    }
  };

  const moveCamera = (direction) => {
    const controls = controlRef.current;
    if (controls && controls.object) {
      const camera = controls.object;
      console.log(camera.position)
      switch (direction) {
        case 'up': camera.position.y += 1; break;
        case 'down': camera.position.y -= 1; break;
        case 'left': camera.position.x -= 1; break;
        case 'right': camera.position.x += 1; break;
        default: break;
      }
      // Keep looking at the center or a fixed point on the grid
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  };

  return (
    <Box position="relative" width="90vw" height="500px">
      <Canvas>
        <OrbitControls ref={controlRef} enableRotate={false} enableZoom={false} enablePan={false} target={[0, 0, 0]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <PerspectiveCamera makeDefault position={[0, 25, 0]} fov={45} />
        {/* <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <meshBasicMaterial attach="material" side={THREE.DoubleSide} />
        </Plane> */}
        <gridHelper args={[20, 20]} />
        <HoverEffect setHoveredTile={setHoveredTile} />
        {hoveredTile && (
          <Plane
            position={[hoveredTile.x, 0.01, hoveredTile.z]}
            args={[1, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={true}>
            <meshBasicMaterial attach="material" color="blue" transparent opacity={0.5} />
          </Plane>
        )}
      </Canvas>
      <Box position="absolute" top={0} right={0} p={1}>
        <IconButton onClick={zoomIn}><ZoomInIcon /></IconButton>
        <IconButton onClick={zoomOut}><ZoomOutIcon /></IconButton>
      </Box>
      <Box position="absolute" left="45%" bottom={0} transform="translateX(-50%)" display="flex">
        <IconButton onClick={() => moveCamera('left')}><ArrowBackIcon /></IconButton>
        <IconButton onClick={() => moveCamera('up')}><ArrowUpwardIcon /></IconButton>
        <IconButton onClick={() => moveCamera('down')}><ArrowDownwardIcon /></IconButton>
        <IconButton onClick={() => moveCamera('right')}><ArrowForwardIcon /></IconButton>
      </Box>
    </Box>
  );
};

export default ParkingLot3D;
