import React, { useRef, useState, useTransition } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Plane, PerspectiveCamera } from '@react-three/drei';
import { IconButton, Button, Box, SpeedDial, SpeedDialIcon, SpeedDialAction, TextField, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
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

const tileTypes = [
  { name: 'parking', texture: spot, icon: '🚗' },
  { name: 'road', texture: road, icon: '🛣️' },
  { name: 'grass', texture: grass, icon: '🌱' },
  { name: 'erase', icon: '🧽' }
];

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
  const [lastConfirmedTiles, setLastConfirmedTiles] = useState({});
  const [currentType, setCurrentType] = useState(null);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [sectorNumbers, setSectorNumbers] = useState({});
  const [sector, setSector] = useState('A');
  const [number, setNumber] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isChanged, setIsChanged] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const loadedTextures = useLoader(TextureLoader, Object.values(textures));
  const textureMap = {
    parking: loadedTextures[0],
    road: loadedTextures[1],
    grass: loadedTextures[2]
  };

  const editTile = (position, typeKey) => {
    console.log(`Editing tile at ${position} with type ${typeKey}`);
    startTransition(() => {
      setIsLoading(true);
      setIsChanged(true);
      if (!editing || typeKey === 'erase') {
        console.log('Erasing or not editing');
        setTiles(prev => {
          const updatedTiles = { ...prev };
          delete updatedTiles[position];
          return updatedTiles;
        });
      } else {
        const newNumber = typeKey === 'parking' ? (sectorNumbers[sector] || 0) + 1 : undefined;
        const tileData = {
          type: typeKey,
          texture: textureMap[typeKey],
          sector,
          number: newNumber,
          rotation: typeKey === 'parking' ? rotation : 0  // Apply rotation only for parking tiles
        };

        setTiles(prev => ({
          ...prev,
          [position]: tileData
        }));
        if (typeKey === 'parking') {
          setSectorNumbers(prev => ({ ...prev, [sector]: newNumber }));
          setNumber(newNumber + 1);
        }
      }
      setIsLoading(false);
    });
  };

  const toggleEditing = () => {
      setEditing(!editing);
  };

  const toggleOpen = () => setOpen(!open);

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
      camera.lookAt(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z));
    }
  };

  const handleSectorChange = (event) => {
    setSector(event.target.value.toUpperCase());
    setNumber((sectorNumbers[event.target.value.toUpperCase()] || 0) + 1);
};

  const handleNumberChange = (event, delta) => {
    setNumber(prev => Math.max(0, prev + delta)); // Ensure number is never negative
  };

  const handleRotate = () => {
    setIsLoading(true);
    startTransition(() => {
      setRotation((prevRotation) => prevRotation - 90);
      setIsLoading(false);
    })
  };

  const confirmEdits = () => {
    setIsLoading(true);
    startTransition(() => {
      console.log("Edits confirmed.");
      setLastConfirmedTiles(tiles);
      setIsChanged(false);
      setIsLoading(false);
    })
  };

  const cancelEdits = () => {
    setIsLoading(true);
    startTransition(() => {
      setTiles(lastConfirmedTiles);
      console.log("Edits cancelled.");
      setIsChanged(false);
      setIsLoading(false);
    })
  };

  const ParkingDetails = () => (
    <Box position="absolute" left="20px" bottom="20px" style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
        <Typography variant="h6">Parking Details</Typography>
        <TextField
            label="Sector"
            value={sector}
            onChange={handleSectorChange}
            variant="outlined"
            size="small"
            style={{ marginBottom: '10px' }}
        />
        <Box display="flex" alignItems="center">
            <Button onClick={() => handleNumberChange(null, -1)}>-</Button>
            <TextField
                label="Number"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                variant="outlined"
                size="small"
                style={{ margin: '0 10px', width: '60px' }}
            />
            <Button onClick={() => handleNumberChange(null, 1)}>+</Button>
        </Box>
        <Box display="flex" alignItems="center">
          <Button startIcon={<RotateLeftIcon />} onClick={handleRotate} fullWidth>
            Rotate
          </Button>
        </Box>
    </Box>
  );

  return (
    <Box position="relative" width="90vw" height="630px">
    {isChanged && <Box position="absolute" top="10px" left="0" right="0" p={2} style={{ margin: 'auto', width: 'fit-content' }}>
      <Button
        variant="contained"
        onClick={confirmEdits}
        disabled={false}
        style={{
          backgroundColor: '#1b1b1b',
          color: '#ffffff',
          marginRight: '10px',
          fontWeight: 'bold',
          padding: '10px 20px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          textTransform: 'none'
        }}
      >
        Confirm
      </Button>
      <Button
        variant="contained"
        onClick={cancelEdits}
        disabled={false}
        style={{
          backgroundColor: '#f3f3f3',
          color: '#1b1b1b',
          fontWeight: 'bold',
          padding: '10px 20px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          textTransform: 'none'
        }}
      >
        Cancel
      </Button>
    </Box>}
    <Box position="relative" width="100%" height="500px" style={{ top: '90px' }}>
      <Canvas>
        <OrbitControls ref={controlRef} enableRotate={false} enableZoom={false} enablePan={false} target={[0, 0, 0]} />
        <ambientLight intensity={2.5} />
        <pointLight position={[10, 10, 10]} />
        <PerspectiveCamera makeDefault position={[0, 25, 0]} fov={45} />
        <gridHelper args={[20, 20]} />
        <HoverEffect editTile={editTile} currentType={currentType} editing={editing}/>
        {Object.entries(tiles).map(([key, { texture, rotation }]) => {
          const [x, z] = key.split(',').map(Number);
          return (
            <Plane key={key} position={[x, 0.01, z]} args={[1, 1]} rotation={[-Math.PI / 2, 0, THREE.MathUtils.degToRad(rotation)]} visible={true}>
              <meshStandardMaterial attach="material" map={texture} />
            </Plane>
          );
        })}
      </Canvas>
      {editing && currentType === 'parking' && <ParkingDetails />}
      <Box position="absolute" right={50} bottom={16}>
        <SpeedDial
          ariaLabel="Edit Options"
          icon={<SpeedDialIcon />}
          onClick={toggleOpen}
          open={open}
        >
          {tileTypes.map((tileType) => (
            <SpeedDialAction
              key={tileType.name}
              icon={tileType.icon}
              tooltipTitle={tileType.name}
              tooltipOpen
              onClick={(event) => {
                event.stopPropagation();
                setCurrentType(tileType.name);
                if (!editing)
                  toggleEditing(true)
              }}
          />
          ))}
        </SpeedDial>
      </Box>
      <Box position="absolute" top={0} right={50} p={1}>
        <IconButton onClick={zoomIn}><ZoomInIcon /></IconButton>
        <IconButton onClick={zoomOut}><ZoomOutIcon /></IconButton>
      </Box>
    </Box>
    <Box position="relative" width="100%" height="500px" style={{ top: '60px' }}>
      <Box position="absolute" top="10px" left="0" right="0" p={2} style={{ margin: 'auto', width: 'fit-content' }}>
        <IconButton onClick={() => moveCamera('left')}><ArrowBackIcon /></IconButton>
        <IconButton onClick={() => moveCamera('up')}><ArrowUpwardIcon /></IconButton>
        <IconButton onClick={() => moveCamera('down')}><ArrowDownwardIcon /></IconButton>
        <IconButton onClick={() => moveCamera('right')}><ArrowForwardIcon /></IconButton>
      </Box>
    </Box>
    </Box>
  );
};

export default ParkingLot3D;
