import React, {useEffect} from 'react';

const BoxEdit = ({
    selectedBox,
    isConfirmingDelete,
    initiateDelete,
    confirmDelete,
    cancelDelete,
    handleDetailChange
}) => {
    useEffect(()=>{
        console.log(selectedBox)
    })
    return (
        selectedBox && (
            <div>
                <div style={{
                    position: 'absolute',
                    top: '0%',
                    right: '19%',
                    backgroundColor: 'black',
                    padding: '5px',
                    border: '1px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white'
                }}>
                    {!isConfirmingDelete ? (
                        <button onClick={initiateDelete} style={{ padding: '5px 10px', marginRight: '10px' }}>
                            Delete
                        </button>
                    ) : (
                        <>
                            <button onClick={confirmDelete} style={{ padding: '5px 10px', marginRight: '10px', color: 'green' }}>
                                ✔ Confirm
                            </button>
                            <button onClick={cancelDelete} style={{ padding: '5px 10px', marginRight: '10px', color: 'red' }}>
                                ✖ Cancel
                            </button>
                        </>
                    )}
                </div>
                <div style={{
                    position: 'absolute',
                    top: '0%',
                    right: '0%',
                    backgroundColor: 'black',
                    padding: '10px',
                    border: '1px solid black',
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '20%',
                    color: 'white'
                }}>
                    <React.Fragment>
                        {/* Level dropdown */}
                        <select
                            style={{ width: '30%', margin: '0 5px', backgroundColor: 'black' }}
                            value={selectedBox.level}
                            onChange={(e) => handleDetailChange('level', e.target.value)}
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                        </select>
                        {/* Letter input */}
                        <input
                            type="text"
                            style={{ width: '30%', margin: '0 5px', backgroundColor: 'black' }}
                            value={selectedBox.letter}
                            onChange={(e) => handleDetailChange('letter', e.target.value)}
                        />
                        {/* Number input */}
                        <input
                            type="number"
                            style={{ width: '30%', margin: '0 5px', backgroundColor: 'black' }}
                            value={selectedBox.number}
                            onChange={(e) => handleDetailChange('number', e.target.value)}
                        />
                    </React.Fragment>
                </div>
            </div>
        )
    );
};

export default BoxEdit;
