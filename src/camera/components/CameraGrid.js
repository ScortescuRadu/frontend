import React from 'react';

const CameraGrid = ({ title, cardData, onAddCamera }) => {
    return (
        <div>
        <div style={sectionTitleStyle}>
            <h2 style={{ textAlign: 'center', fontSize: '1.4em' }}>{title}</h2>
        </div>
            <div style={gridContainerStyle}>
                <div style={cardStyle} onClick={onAddCamera}>
                    <div style={plusStyle}>+</div>
                    <div style={titleStyle}>Add Camera</div>
                </div>
                {cardData.map(card => (
                    <div key={card.id} style={parkCardStyle}>
                        <h3 style={h3Style}>{card.title}</h3>
                        <p>{card.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const sectionTitleStyle = {
    background: 'linear-gradient(to left, #fff 0%, #000 100%)',
    padding: '20px',
    marginTop: '50px',
    marginBottom: '20px',
    borderRadius: '10px',
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
};

const plusStyle = {
    fontSize: '36px',
    color: '#fff',
};

const titleStyle = {
    marginTop: '10px',
    fontSize: '16px',
    color: '#fff',
};

const parkCardStyle = {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    cursor: 'pointer',

    ':hover': {
      transform: 'scale(1.05)',
    },
};

const h3Style = {
    marginBottom: '10px',
};

export default CameraGrid;
