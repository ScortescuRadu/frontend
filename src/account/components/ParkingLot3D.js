import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Plane, PerspectiveCamera } from '@react-three/drei';
import { IconButton, Button, Box } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Palette from './MapPallete';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import spot from '../assets/spot.jpg'
import road from '../assets/road.jpg'
import grass from '../assets/grass.jpg'

const textures = {
  parking: spot,
  road: road,
  grass: grass
};

const HoverEffect = ({ editTile, currentType, editing }) => {
  const planeRef = useRef();
  const { mouse } = useThree();

  useFrame(({ camera }) => {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      raycaster.intersectObject(planeRef.current);
  });

  const handleClick = (event) => {
    if (!editing || !currentType) return;
    const { x, z } = event.point;
    const tileKey = `${Math.floor(x) + 0.5},${Math.floor(z) + 0.5}`;
    editTile(tileKey, currentType);
  };

  return (
    <Plane
      ref={planeRef}
      args={[20, 20]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
      visible={false}
    >
      {/* Material does not need to set texture here as this plane is not visible */}
    </Plane>
  );
};

const ParkingLot3D = () => {
  const controlRef = useRef();
  const [hoveredTile, setHoveredTile] = useState(null);
  const [tiles, setTiles] = useState({});
  const [currentType, setCurrentType] = useState(null);
  const [editing, setEditing] = useState(false);

  const loadedTextures = useLoader(TextureLoader, Object.values(textures));
  const textureMap = {
    parking: loadedTextures[0],
    road: loadedTextures[1],
    grass: loadedTextures[2]
  };

  const editTile = (position, typeKey) => {
    console.log(`Editing tile at ${position} with type ${typeKey}`);
    if (!editing || typeKey === 'erase') {
      console.log('Erasing or not editing');
      setTiles(prev => {
        const updatedTiles = { ...prev };
        delete updatedTiles[position];
        return updatedTiles;
      });
    } else if (textureMap[typeKey]) {
      console.log('Applying texture:', textureMap[typeKey]);
      setTiles(prev => ({ ...prev, [position]: textureMap[typeKey] }));
    }
  };

  const toggleEditing = () => {
      setEditing(!editing);
  };

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
        <gridHelper args={[20, 20]} />
        <HoverEffect editTile={editTile} currentType={currentType} editing={editing}/>
        {Object.entries(tiles).map(([key, texture]) => {
            const [x, z] = key.split(',').map(Number);
            return (
                <Plane
                    key={key}
                    position={[x, 0.01, z]}
                    args={[1, 1]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    visible={true}>
                    <meshBasicMaterial attach="material" map={texture} />
                </Plane>
            );
        })}
      </Canvas>
      <Box position="absolute" left="0%" bottom={12} transform="translateX(-50%)" display="flex">
        <Palette setCurrentType={setCurrentType} />
        <Button onClick={toggleEditing} variant="contained" color="primary">
          {editing ? 'Stop Editing' : 'Edit'}
        </Button>
      </Box>
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
