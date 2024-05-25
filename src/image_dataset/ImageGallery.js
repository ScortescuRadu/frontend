import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Button, Typography, Modal } from '@mui/material';
import { ReactTyped } from "react-typed";
import BoundingBox from './BoundingBox';

const backendUrl = 'http://127.0.0.1:8000'

const ImageGallery = () => {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(9);
    const fetchImagesCalled = useRef(false);

    const fetchImages = async (start, end) => {
        try {
        const response = await fetch('http://127.0.0.1:8000/image-dataset/images/', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ start, end }),
        });
        const data = await response.json();
        setImages((prevImages) => [...prevImages, ...data]);
        } catch (error) {
        console.error('Error fetching images:', error);
        }
    };

    useEffect(() => {
        if (!fetchImagesCalled.current) {
            fetchImages(start, end);
            fetchImagesCalled.current = true;
        }
    }, [start, end]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const handleSeeMore = () => {
        setStart((prevStart) => prevStart + 15);
        setEnd((prevEnd) => prevEnd + 15);
    };

    const calculateScale = (img) => {
        const scaleX = img.clientWidth / img.naturalWidth;
        const scaleY = img.clientHeight / img.naturalHeight;
        console.log(scaleX, scaleY);
        return { scaleX, scaleY };
    };

    return (
        <div>
            <div
                style={{
                    padding: '20px',
                    textAlign: 'center',
                    marginTop: '20px',
                    textColor: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }}
            >
                <Typography variant='h3' color='white'>
                    Continuously{" "}
                    <ReactTyped strings={["improving..."]} typeSpeed={100} />
                </Typography>
                <Typography variant='h6' gutterBottom color='white'>
                    With a large community of active users, our dataset is public and covers a wide range of scenarios!
                </Typography>
            </div>
            <div style={{ marginTop: '16px', textAlign: 'center' }} >
                <Button 
                    variant='contained'
                    style={{ backgroundColor: 'white', color: 'black', padding: '12px' }}
                    href={`${backendUrl}/path/to/dataset.zip`} 
                    download
                >
                    Download Dataset
                </Button>
            </div>
            <Box
                p={4}
                bgcolor='white'
                boxShadow={4}
                borderRadius='8px'
                textAlign='center'
                mt={6}
            >
                <Grid container spacing={2} justifyContent='center'>
                    {images.map((image, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index} style={{ position: 'relative' }}>
                            <img
                                src={`${backendUrl}${image.image}`}
                                alt={`Image ${index + 1}`}
                                style={{ width: '100%', cursor: 'pointer' }}
                                onClick={() => handleImageClick(image)}
                                onLoad={(e) => {
                                    const { scaleX, scaleY } = calculateScale(e.target);
                                    image.scaleX = scaleX;
                                    image.scaleY = scaleY;
                                    setImages((prevImages) => prevImages.map((img, idx) => idx === index ? { ...img, scaleX, scaleY } : img)); // Force re-render to update bounding boxes
                                }}
                            />
                            {image.bounding_boxes_json && image.bounding_boxes_json.map((box, boxIndex) => (
                                <BoundingBox key={boxIndex} box={box.box} scaleX={image.scaleX || 1} scaleY={image.scaleY || 1} />
                            ))}
                        </Grid>
                    ))}
                </Grid>

                {images.length > 0 && (
                    <Button variant='contained' color='primary' style={{ marginTop: '16px' }} onClick={handleSeeMore}>
                        See More
                    </Button>
                )}

                <Modal
                    open={Boolean(selectedImage)}
                    onClose={handleCloseModal}
                    aria-labelledby='image-modal-title'
                    aria-describedby='image-modal-description'
                >
                    <Box
                        position='absolute'
                        top='25%'
                        left='25%'
                        right='25%'
                        // transform='translate(-50%, -50%)'
                        bgcolor='white'
                        boxShadow={24}
                        p={4}
                        borderRadius='8px'
                        textAlign='center'
                    >
                        {selectedImage && (
                            <>
                                <Typography id='image-modal-title' variant='h6'>
                                    Image Details
                                </Typography>
                                <img
                                    src={`${backendUrl}${selectedImage.image}`}
                                    alt={selectedImage.bounding_boxes_json}
                                    style={{ width: '100%', marginTop: '16px' }}
                                />
                            </>
                        )}
                    </Box>
                </Modal>
            </Box>
        </div>
    );
};

export default ImageGallery;