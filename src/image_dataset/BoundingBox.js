import React from 'react';

const BoundingBox = ({ box, scaleX, scaleY }) => {
    const originalImageHeight = 700
    const originalImageWidth = 500

    return (
        <div
            style={{
                position: 'absolute',
                border: '2px solid red',
                left: `${box[0].x * originalImageWidth * scaleX}px`,
                top: `${box[0].y * originalImageHeight * scaleY}px`,
                width: `${(box[2].x - box[0].x) * originalImageWidth * scaleX}px`,
                height: `${(box[2].y - box[0].y) * originalImageHeight * scaleY}px`,
                cursor: 'default',
                pointerEvents: 'none'
            }}
        />
    );
};

export default BoundingBox;
