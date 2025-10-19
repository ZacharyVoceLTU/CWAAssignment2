'use client'

import React, { useState, useRef, ChangeEvent } from 'react';
import styles from '@/components/imageuploader/imageuploader.module.css';
import ImageMenu from '../imageMenu/imageMenu';

import { generateHTMLFile } from '@/lib/exportGenerator';

interface AppliedImage {
    id: number;
    url: string;
    x: number;
    y: number;
    hintText: string;
    clueText: string;
    answer: string;
    isFlipped: boolean;
    fileName: string;
}

interface ImageUploaderProps {
    timeLimitSeconds: number;
}

interface UpdatedMetadata {
    hintText: string;
    clueText: string;
    answer: string;
}

const PRE_PICKED_IMAGES: AppliedImage[] = [
    {
        id: 1,
        url: '/images/Chest_one.png', // Replace with your actual path/URL
        x: 100, // Initial position
        y: 100,
        hintText: 'Hint for Image 1',
        clueText: 'Clue for Image 1',
        answer: 'Answer 1',
        fileName: 'Chest_one.png',
        isFlipped: false
    },
    {
        id: 2,
        url: '/images/Chest_two.png', // Replace with your actual path/URL
        x: 300,
        y: 100,
        hintText: 'Hint for Image 2',
        clueText: 'Clue for Image 2',
        answer: 'Answer 2',
        fileName: 'Chest_two.png',
        isFlipped: false
    },
    {
        id: 3,
        url: '/images/Chest_three.png', // Replace with your actual path/URL
        x: 500,
        y: 100,
        hintText: 'Hint for Image 3',
        clueText: 'Clue for Image 3',
        answer: 'Answer 3',
        fileName: 'Chest_three.png',
        isFlipped: false
    },
];

const APIURL = "http://ec2-54-162-37-116.compute-1.amazonaws.com:4080";

const ImageUploader: React.FC<ImageUploaderProps> = ({timeLimitSeconds}) => {
    const [appliedImages, setAppliedImages] = useState<AppliedImage[]>(PRE_PICKED_IMAGES);
    const [deletedImages, setDeletedImages] = useState<AppliedImage[]>([]);
    const [draggingImageId, setDraggingImageId] = useState<number | null>(null);
    const [menu, setMenu] = useState<{id: number, x:number, y:number} | null>(null);
    const [isDirty, setIsDirty] = useState<boolean>(false);

    const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
    const [roomName, setRoomName] = useState<string>('New Escape Room');

    const markAsDirty = () => {
        setIsDirty(true);
    };

    const deleteImage = (imageId: number) => {
    // 1. Find the image to be deleted
        const imageToDelete = appliedImages.find(image => image.id === imageId);
        
        if (imageToDelete) {
            // 2. Remove it from the applied list
            setAppliedImages(prevImages => prevImages.filter(image => image.id !== imageId));
            
            // 3. Add it to the deleted list (soft delete)
            setDeletedImages(prevDeleted => [...prevDeleted, imageToDelete]);
        };

        setMenu(null);
        markAsDirty();
    }; 

    const restoreImage = (imageId: number) => {
        // Find the image to restore
        const imageToRestore = deletedImages.find(image => image.id === imageId);
        
        if (imageToRestore) {
            // Remove it from the deleted list
            setDeletedImages(prevDeleted => prevDeleted.filter(image => image.id !== imageId));
            
            // Add it back to the applied list
            setAppliedImages(prevImages => {
                // Re-add the image, preserving its old position (x, y)
                return [...prevImages, imageToRestore].sort((a, b) => a.id - b.id);
            });
        }
        markAsDirty();
    };

    const handleUpdateMetadata = (id: number, updatedMetadata: UpdatedMetadata) => {
        setAppliedImages(prevImages => 
            prevImages.map(image => 
                image.id === id ? { ...image, ...updatedMetadata } : image
            )
        );
        markAsDirty();
    };

    const handleFlipImage = (imageId: number) => {
        setAppliedImages(prevImages => 
            prevImages.map(image => 
                image.id === imageId ? { ...image, isFlipped: !image.isFlipped } : image
            )
        );
        markAsDirty();
    };

    // --- Native Drag-and-Drop Logic ---
    const handleDragStart = (e: React.DragEvent<HTMLImageElement>, id: number) => {
        e.dataTransfer.setData("text/plain", id.toString());
        setDraggingImageId(id);
    };

    const handleDragEnd = () => {
        setDraggingImageId(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedId = Number(e.dataTransfer.getData("text/plain"));
        const newX = e.clientX - e.currentTarget.getBoundingClientRect().left;
        const newY = e.clientY - e.currentTarget.getBoundingClientRect().top;

        setAppliedImages(prevImages =>
            prevImages.map(image =>
                image.id === droppedId ? { ...image, x: newX, y: newY } : image
            )
        );
        setDraggingImageId(null);
        markAsDirty();
    };

    const closeMenu = () => {
        setMenu(null);
    };

    const handleDoubleClick = (e: React.MouseEvent, imageId: number) => {
        // stop event from propagating, can interfere with the drag

        e.stopPropagation();

        setMenu({
            id: imageId,
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomName(e.target.value);
        markAsDirty(); // 👈 Mark as dirty on every text input
    }

    // Have it update if id exists
    const saveToDatabase = async() => {
        // If currentRoomId exists, call update, otherwise call create
        if (currentRoomId !== null) {
            // Existing update logic
            await updateRoomInDatabase(currentRoomId, roomName); 
            // Check if successful, then:
            setIsDirty(false); // Reset on successful update
            return;
        }

        // CREATE (POST) Logic
        console.log(`Attempting to SAVE (CREATE) new room: ${roomName}`);
        try {
            const response = await fetch(`${APIURL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: roomName, // Uses the user-chosen name
                    appliedImagesData: appliedImages
                }),
            });
            if (response.ok) {
                const result = await response.json();
                // 💡 ASSUMES your backend returns { id: newId, ... }
                console.log(`Room configuration saved successfully. ID: ${result.id}`);
                setCurrentRoomId(result.id); // Set the new ID
                setIsDirty(false);
            } else {
                console.error('Failed to save room configuration.');
            }
        } catch (error) {
            console.error('Error saving room configuration', error);
        }
    };

    // REPLACE YOUR EXISTING deleteRoomFromDatabase with this:
    const deleteRoomFromDatabase = async () => {
        if (currentRoomId === null) {
            console.warn('Cannot delete: No room ID is currently loaded.');
            return;
        }

        console.log(`Attempting to DELETE room ID: ${currentRoomId}`);
        try {
            const response = await fetch(`${APIURL}/api/users?id=${currentRoomId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log(`Room configuration ID ${currentRoomId} deleted successfully.`);
                setAppliedImages(PRE_PICKED_IMAGES); 
                setDeletedImages([]);
                setCurrentRoomId(null); // 🗑️ Clear the ID
                setRoomName('New Escape Room'); // 🗑️ Reset the name
            } else {
                console.error(`Failed to delete room ID ${currentRoomId}. Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting room configuration:', error);
        }
    };

    // Update the image url, x, y
    const updateRoomInDatabase = async (roomId: number, roomName: string) => {
        console.log(`Attempting to UPDATE room ID: ${roomId} with name: ${roomName}`);
        try {
            const response = await fetch(`${APIURL}/api/users?id=${roomId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: roomName, // Uses the user-chosen name
                    appliedImagesData: appliedImages, 
                }),
            });
            
            if (response.ok) {
                console.log(`Room configuration ID ${roomId} updated successfully.`);
            } else {
                console.error(`Failed to update room ID ${roomId}. Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating room configuration:', error);
        }
    };

    const loadRoomFromDatabase = async (roomId: number) => {
        console.log(`Attempting to LOAD room ID: ${roomId}`);
        try {
            const response = await fetch(`${APIURL}/api/users?id=${roomId}`);
            
            if (response.ok) {
                const roomData = await response.json();
                console.log(`Room configuration ID ${roomId} loaded successfully.`);
                
                // 🥳 Set local state with the loaded data
                setAppliedImages(roomData.appliedImagesData || []);
                setCurrentRoomId(roomId); 
                setRoomName(roomData.name || 'Untitled Room'); // Set the loaded room name
                setDeletedImages([]); 
                setIsDirty(false);
                
            } else if (response.status === 404) {
                console.warn(`Room ID ${roomId} not found.`);
            } else {
                console.error(`Failed to load room ID ${roomId}. Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading room configuration:', error);
        }
    };

    const handleExport = () => {
        // Pass the two necessary pieces of state to the external function
        generateHTMLFile(appliedImages, timeLimitSeconds);
    };

    return (
        <div>
            <div
                className={styles.applied_image_area}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {appliedImages.map(image => (
                    <img
                        key={image.id}
                        src={image.url}
                        alt='Applied'
                        className={styles.applied_image}
                        style={{
                            left: image.x,
                            top: image.y,
                            cursor: 'grab',
                            position: 'absolute',
                            display: 'block',
                            transform: image.isFlipped ? 'scaleX(-1)' : 'none',
                        }}
                        draggable='true'
                        onDragStart={(e) => handleDragStart(e, image.id)}
                        onDragEnd={handleDragEnd}
                        onDoubleClick={(e) => handleDoubleClick(e, image.id)}
                    />
                ))}
            </div>

            {menu && menu.id && (
                <ImageMenu
                    image={appliedImages.find(img => img.id === menu.id)}
                    x={menu.x}
                    y={menu.y}
                    onClose={closeMenu}
                    onDelete={deleteImage}
                    onUpdateMetadata={handleUpdateMetadata}
                    onFlip={handleFlipImage}
                />
            )}
            {deletedImages.length > 0 && (
                <div className={styles.restoration_area}>
                    <h4>Deleted Images (Click to Restore):</h4>
                    <div className={styles.deleted_list}>
                        {deletedImages.map(image => (
                            <div 
                                key={image.id} 
                                className={styles.deleted_item}
                                onClick={() => restoreImage(image.id)}
                                title={`Restore: ${image.fileName}`}
                            >
                                {image.fileName}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Database stuff */}
            <div style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
                <label>
                    **Room Name:** <input 
                        type="text" 
                        value={roomName} 
                        onChange={handleRoomNameChange} 
                        placeholder="Enter Room Name"
                        style={{ marginLeft: '10px', padding: '5px', width: '250px' }}
                    />
                </label>
                <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>
                    Current ID: {currentRoomId === null ? 'None (New Room)' : currentRoomId}
                </span>
            </div>
            {/* ------------------------------------------- */}

            {/* ... other content (image area, menu, deleted images) ... */}

            {/* Consolidated Save/Update Button */}
            <button onClick={saveToDatabase} style={{ fontWeight: 'bold' }}>
                {currentRoomId === null 
                    ? '💾 Save New Room (POST)' 
                    : isDirty // Use isDirty to show the updated status
                        ? `* 🔄 Update Room (PATCH)`
                        : '✔️ Saved (No Changes)'
                }
            </button>
            
            {/* Delete Button */}
            <button 
                onClick={deleteRoomFromDatabase} 
                disabled={currentRoomId === null}
                style={{ marginLeft: '10px', backgroundColor: currentRoomId === null ? '#ccc' : 'red', color: 'white' }}
            >
                🗑️ Delete Current Room
            </button>

            {/* Load Input (uses the helper component added in 3A) */}
            <LoadRoomInput loadRoom={loadRoomFromDatabase} />

            <button onClick={handleExport} className={styles.export_button}>
                Export HTML File
            </button>
        </div>
    );
};

export default ImageUploader;

interface LoadRoomInputProps {
    loadRoom: (id: number) => Promise<void>;
}

const LoadRoomInput: React.FC<LoadRoomInputProps> = ({ loadRoom }) => {
    const [idToLoad, setIdToLoad] = useState<string>('');

    const handleLoad = () => {
        const id = parseInt(idToLoad);
        if (!isNaN(id)) {
            loadRoom(id);
            setIdToLoad(''); // Clear the input after attempting load
        } else {
            console.error("Please enter a valid number for Room ID.");
        }
    };

    return (
        <span style={{ marginLeft: '20px', padding: '5px', border: '1px solid #ddd' }}>
            <label>Load by ID:</label>
            <input 
                type="number"
                value={idToLoad}
                onChange={(e) => setIdToLoad(e.target.value)}
                placeholder="Enter ID"
                style={{ width: '80px', marginLeft: '5px', marginRight: '5px' }}
            />
            <button onClick={handleLoad}>📥 Load</button>
        </span>
    );
}