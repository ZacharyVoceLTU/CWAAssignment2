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
    };

    const handleUpdateMetadata = (id: number, updatedMetadata: UpdatedMetadata) => {
        setAppliedImages(prevImages => 
            prevImages.map(image => 
                image.id === id ? { ...image, ...updatedMetadata } : image
            )
        );
    };

    const handleFlipImage = (imageId: number) => {
        setAppliedImages(prevImages => 
            prevImages.map(image => 
                image.id === imageId ? { ...image, isFlipped: !image.isFlipped } : image
            )
        );
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

    // Have it update if id exists
    const saveToDatabase = async() => {
        console.log(appliedImages)
        try {
            const response = await fetch(`${APIURL}/api/users/`, {  // Replace with api
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // TODO: Add name option
                    name: 'd',
                    appliedImagesData: appliedImages
                }),
            });
            if (response.ok) {
                console.log('Image positions saved successfully');
            } else {
                console.error('Failed to save image positions.');
            }
        } catch (error) {
            console.error('Error saving image positions', error);
        }
    };

    const deleteRoomFromDatabase = async (roomId: number) => {
        // 💡 IMPORTANT: Use the correct API path (e.g., /api/erconfig)
        try {
            const response = await fetch(`${APIURL}/api/users?id=${roomId}`, {
                method: 'DELETE',
                // No body is strictly required for DELETE with a query parameter ID
            });

            if (response.ok) {
                console.log(`Room configuration ID ${roomId} deleted successfully.`);
                // After successful deletion, you would typically clear the local state
                setAppliedImages(PRE_PICKED_IMAGES); 
                setDeletedImages([]);
                // TODO: Add roomId
                // setCurrentRoomId(null);
            } else {
                console.error(`Failed to delete room ID ${roomId}. Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting room configuration:', error);
        }
    };

    // Update the image url, x, y
    const updateRoomInDatabase = async (roomId: number, roomName: string) => {
        // 💡 IMPORTANT: Use the correct API path and PATCH method
        try {
            const response = await fetch(`${APIURL}/api/users?id=${roomId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: roomName, // Send the name if it can be updated
                    appliedImagesData: appliedImages, // Send the full, current state
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
        // 💡 IMPORTANT: Use the correct API path and GET method
        try {
            const response = await fetch(`${APIURL}/api/erconfig?id=${roomId}`);
            
            if (response.ok) {
                const roomData = await response.json();
                console.log(`Room configuration ID ${roomId} loaded successfully.`);
                
                // TODO: Set local state with the data from the database
                // setAppliedImages(roomData.appliedImagesData || []);
                // setCurrentRoomId(roomId); 
                // setDeletedImages([]); // Clear any temporary deleted images
                
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
            <button onClick={saveToDatabase}>
                Save Room
            </button>
            <button onClick={handleExport} className={styles.export_button}>
                Export HTML File
            </button>
        </div>
    );
};

export default ImageUploader;