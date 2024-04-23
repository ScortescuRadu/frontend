// import React, { useState, useEffect } from 'react';
// import Webcam from 'react-webcam';
// import ReactPlayer from 'react-player';

// const ParkView = () => {
//   const [webcamRef, setWebcamRef] = useState(null);
//   const [cameraList, setCameraList] = useState([]);
//   const [newCameraUrl, setNewCameraUrl] = useState('');
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedCamera, setSelectedCamera] = useState(null);
//   const [hoveredIndex, setHoveredIndex] = useState(null);

//   useEffect(() => {
//     const detectCameras = async () => {
//       try {
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         const cameras = devices.filter((device) => device.kind === 'videoinput');
//         setCameraList(cameras);
//       } catch (error) {
//         console.error('Error detecting cameras:', error);
//       }
//     };

//     detectCameras();
//   }, []);

//   const handleAddCamera = () => {
//     setShowAddForm(true);
//   };

//   const handleFormSubmit = (event) => {
//     event.preventDefault();

//     if (newCameraUrl.trim() !== '') {
//       setCameraList([...cameraList, { kind: 'custom', url: newCameraUrl }]);
//       setNewCameraUrl('');
//       setShowAddForm(false);
//     }
//   };

//   const handleCameraClick = (index) => {
//     setSelectedCamera(cameraList[index]);
//   };

//   const handleCloseModal = () => {
//     setSelectedCamera(null);
//   };

//   return (
//     <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
//     <h1>Camera View</h1>
//     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
//       {cameraList.map((camera, index) => (
//         <div
//           key={index}
//           style={{ position: 'relative', cursor: 'pointer', backgroundColor: '#fff', borderRadius: '8px', color: '#000'}}
//           onMouseEnter={() => setHoveredIndex(index)}
//           onMouseLeave={() => setHoveredIndex(null)}
//           onClick={() => handleCameraClick(index)}
//         >
//           <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', position: 'relative' }}>
//             {camera.kind === 'videoinput' && (
//               <>
//                 <Webcam audio={false} style={{ maxWidth: '100%', height: 'auto' }} />
//                 {hoveredIndex === index && (
//                   <div
//                     style={{
//                       position: 'absolute',
//                       top: 10,
//                       right: 10,
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       background: 'rgba(255, 255, 255, 0.8)',
//                       borderRadius: '50%',
//                       width: 30,
//                       height: 30,
//                       cursor: 'pointer',
//                     }}
//                   >
//                     {/* Replace this icon with your full-size icon */}
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path d="M3 22V2L21 12L3 22Z" fill="#000" />
//                     </svg>
//                   </div>
//                 )}
//               </>
//             )}
//             {camera.kind === 'custom' && (
//               <>
//                 <ReactPlayer url={camera.url} playing style={{ maxWidth: '100%', height: 'auto' }} />
//                 {hoveredIndex === index && (
//                   <div
//                     style={{
//                       position: 'absolute',
//                       top: 10,
//                       right: 10,
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       background: 'rgba(255, 255, 255, 0.8)',
//                       borderRadius: '50%',
//                       width: 30,
//                       height: 30,
//                       cursor: 'pointer',
//                     }}
//                   >
//                     {/* Replace this icon with your full-size icon */}
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path d="M3 22V2L21 12L3 22Z" fill="#000" />
//                     </svg>
//                   </div>
//                 )}
//               </>
//             )}
//             <div style={{ marginTop: '10px', overflowY: 'auto', maxHeight: '80px' }}>
//               {Array.from({ length: 10 }, (_, i) => (
//                 <p key={i}>Section: {index + 1} Number: {i + 1} isAvailable</p>
//               ))}
//             </div>
//             <button style={{ marginTop: '10px', justifyContent: 'center' }}>Edit</button>
//           </div>
//         </div>
//       ))}
//       {showAddForm ? (
//         <div style={{ border: '1px dashed #ddd', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
//         <form onSubmit={handleFormSubmit}>
//             <label style={{ color: 'white', marginBottom: '10px' }}>
//             Select Camera:
//             <select
//                 value={selectedCamera ? selectedCamera.kind === 'videoinput' ? selectedCamera.deviceId : selectedCamera.url : ""}
//                 onChange={(e) => setNewCameraUrl(e.target.value)}
//                 style={{ color: 'black', marginLeft: '10px' }}
//             >
//                 <option value="" disabled>Select a camera</option>
//                 {cameraList.map((camera, index) => (
//                 <option key={index} value={camera.kind === 'videoinput' ? camera.deviceId : camera.url}>
//                     {camera.kind === 'videoinput' ? `Camera ${index + 1}` : `Custom Camera ${index + 1}`}
//                 </option>
//                 ))}
//             </select>
//             </label>
//             <button type="submit">Add Camera</button>
//         </form>
//         </div>
//       ) : (
//         <div
//           style={{
//             border: '1px dashed #ddd',
//             padding: '16px',
//             borderRadius: '8px',
//             textAlign: 'center',
//             cursor: 'pointer',
//           }}
//           onClick={handleAddCamera}
//         >
//           <h3>+</h3>
//           <p>Add Camera</p>
//         </div>
//       )}
//     </div>
//     {selectedCamera && (
//       <div
//         style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           width: '100%',
//           height: '100%',
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <div style={{ position: 'relative' }}>
//           {selectedCamera.kind === 'videoinput' && <Webcam audio={false} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px'}} />}
//           {selectedCamera.kind === 'custom' && <ReactPlayer url={selectedCamera.url} playing style={{ maxWidth: '100%', maxHeight: '100%' }} />}
//           <button onClick={handleCloseModal} style={{ position: 'absolute', top: 10, right: 10 }}>
//                 ❌
//           </button>
//         </div>
//       </div>
//     )}
//   </div>
//   );
// };

// export default ParkView;
