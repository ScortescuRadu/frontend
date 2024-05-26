import React from 'react';

const BoundingBox = ({ originalImageWidth, originalImageHeight, is_drawn, box, scaleX, scaleY }) => {
    const drawnStyle = {
        position: 'absolute',
        border: '2px solid red',
        left: `${box[0].x * originalImageWidth * scaleX}px`,
        top: `${box[0].y * originalImageHeight * scaleY}px`,
        width: `${(box[2].x - box[0].x) * originalImageWidth * scaleX}px`,
        height: `${(box[2].y - box[0].y) * originalImageHeight * scaleY}px`,
        cursor: 'default',
        pointerEvents: 'none'
    };

    const defaultStyle = {
        position: 'absolute',
        border: '2px solid red',
        left: `${box[0] * scaleX + 15 }px`,
        top: `${box[1] * scaleY + 15 }px`,
        width: `${(box[2] - box[0]) * scaleX}px`,
        height: `${(box[3] - box[1]) * scaleY}px`,
        cursor: 'default',
        pointerEvents: 'none'
    };
    console.log('is_drawn:', is_drawn);
    console.log('box:', box);
    console.log('style:', is_drawn ? drawnStyle : defaultStyle);
    return (
        <div
            style={is_drawn ? drawnStyle : defaultStyle}
        />
    );
};

export default BoundingBox;
