import React, { useRef, useEffect, useState } from 'react';

const DrawingCanvas = ({ currentFrameImage, onSave, onCancel }) => {
    const canvasRef = useRef(null);
    const [points, setPoints] = useState([]);
    const [polygons, setPolygons] = useState([]);
    const [isErasing, setIsErasing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            redrawCanvas();
        }

        function redrawCanvas() {
            context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            polygons.forEach(polygon => {
                if (polygon.length === 4) {
                    const sortedPolygon = sortPointsToRectangle(polygon);
                    drawPolygon(context, sortedPolygon);
                }
            });
            // Redraw current drawing points and lines
            points.forEach(point => drawPoint(context, point));
            if (points.length > 1) {
                for (let i = 1; i < points.length; i++) {
                    drawLine(context, points[i - 1], points[i]);
                }
            }
        }

        function sortPointsToRectangle(points) {
            points.sort((a, b) => a.y - b.y);
            let topTwo = points.slice(0, 2);
            let bottomTwo = points.slice(2, 4);
            topTwo.sort((a, b) => a.x - b.x);
            bottomTwo.sort((a, b) => a.x - b.x);
            return [topTwo[0], topTwo[1], bottomTwo[1], bottomTwo[0]];
        }

        function drawPoint(context, point) {
            context.fillStyle = 'blue';
            context.beginPath();
            context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
            context.fill();
        }

        function drawLine(context, startPoint, endPoint) {
            context.beginPath();
            context.moveTo(startPoint.x, startPoint.y);
            context.lineTo(endPoint.x, endPoint.y);
            context.strokeStyle = 'red';
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
        }

        function drawPolygon(context, points) {
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);
            points.forEach(point => context.lineTo(point.x, point.y));
            context.lineTo(points[0].x, points[0].y);
            context.strokeStyle = 'red';
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function handleCanvasClick(e) {
            if (points.length >= 4) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const newPoints = [...points, { x, y }];
            setPoints(newPoints);
            if (newPoints.length === 4) {
                setPolygons([...polygons, newPoints]);
                setPoints([]); // Start a new polygon
                redrawCanvas(); // Redraw immediately to clear temporary lines and points
            } else {
                redrawCanvas(); // Redraw to add new point and line
            }
        }

        canvas.addEventListener('click', handleCanvasClick);

        return () => {
            canvas.removeEventListener('click', handleCanvasClick);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [points, polygons]);

    // const handleSaveAll = () => {
    //     onSave(polygons.map(polygon => sortPointsToRectangle(polygon)));
    //     setPolygons([]);
    //     setPoints([]);
    // };

    const handleCancelAll = () => {
        onCancel();
        setPolygons([]);
        setPoints([]);
    };

    const toggleEraser = () => {
        setIsErasing(!isErasing);
    };

    return (
        <div style={{ position: 'relative' }}>
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 5, cursor: isErasing ? 'copy' : 'crosshair' }}/>
            <img src={currentFrameImage} alt="Frame" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {points.length === 4 && (
                <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10 }}>
                    <button onClick={() => onSave(points)}>Save</button>
                    <button onClick={() => { setPoints([]); onCancel(); }}>Cancel</button>
                    <button onClick={toggleEraser}>{isErasing ? 'Stop Erasing' : 'Erase'}</button>
                </div>
            )}
        </div>
    );
};

export default DrawingCanvas;
