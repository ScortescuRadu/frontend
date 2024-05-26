import React from 'react';

const CameraGrid = ({ title, cardData, onAddCamera }) => {
    return (
        <div>
            <div style={gridContainerStyle}>
                <div style={cardStyle} onClick={onAddCamera}>
                    <div style={plusStyle}>+</div>
                    <div style={cardTitleStyle}>Add Camera</div>
                </div>
                {title ==="spot" && cardData && cardData.length > 0 && cardData.map((card, index) => (
                    <div key={index} style={cameraCardStyle}>
                        <h3 style={h3Style}>{card.camera_address}</h3>
                        <div style={spotsGridContainerStyle}>
                            {card.spots.map((spot) => (
                                <div
                                    key={spot.id}
                                    style={{
                                        ...spotStyle,
                                        backgroundColor: spot.is_occupied ? 'red' : 'green'
                                    }}
                                >
                                    {`${spot.level}/${spot.sector}/${spot.number}`}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const cameraCardStyle = {
    backgroundColor: 'black',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    color: 'white',
    maxHeight: '300px', // Set a fixed height for the card
    overflow: 'auto', // Make the card scrollable if content overflows
    cursor: 'pointer',

    ':hover': {
      transform: 'scale(1.05)',
    },
};

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    padding: '20px',
};

const cardStyle = {
    border: '2px dotted #fff',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '20px',
    height: '150px',
    textAlign: 'center',
};

const noDataStyle = {
    color: '#fff',
    textAlign: 'center',
    fontSize: '18px',
    marginTop: '20px'
};

const plusStyle = {
    fontSize: '36px',
    color: '#fff',
};

const cardTitleStyle = {
    marginTop: '10px',
    fontSize: '16px',
    color: '#fff',
};

const parkCardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    cursor: 'pointer',
    textAlign: 'center',

    ':hover': {
        transform: 'scale(1.05)',
    },
};

const h3Style = {
    marginBottom: '10px',
    color: 'white',
    fontSize: '1.5em',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
};

const spotsGridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
    gap: '10px',
    maxHeight: '200px',
    overflowY: 'auto',
};

const spotStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    borderRadius: '4px',
    padding: '10px',
};

export default CameraGrid;
