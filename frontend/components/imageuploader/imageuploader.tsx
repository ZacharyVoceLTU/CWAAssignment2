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
    fileName: string;
}

interface ImageUploaderProps {
    timeLimitSeconds: number;
}

interface SelectedImageMetadata {
    url: string;
    hintText: string;
    clueText: string;
    answer: string;
    fileName: string
}

const APIURL = "http://ec2-54-83-190-191.compute-1.amazonaws.com";

const ImageUploader: React.FC<ImageUploaderProps> = ({timeLimitSeconds}) => {
    const [selectedImage, setSelectedImage] = useState<SelectedImageMetadata | null>(null);
    const [appliedImages, setAppliedImages] = useState<AppliedImage[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draggingImageId, setDraggingImageId] = useState<number | null>(null);

    const [menu, setMenu] = useState<{id: number, x:number, y:number} | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage({
                url: imageUrl,
                hintText: '',
                clueText: '',
                answer: '',
                fileName: file.name,
            })
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const applyImage = () => {
        if (selectedImage && appliedImages.length < 3) {
            const newImage: AppliedImage = {
                id: Date.now(),
                url: selectedImage.url,
                x: 0, // Initial position
                y: 0, // Initial position
                hintText: selectedImage.hintText, // Save the data
                clueText: selectedImage.clueText, // Save the data
                answer: selectedImage.answer,
                fileName: selectedImage.fileName,
            };
            setAppliedImages([...appliedImages, newImage]);
            clearImage();
        }
    };

    const deleteImage = (imageId: number) => {
        setAppliedImages(prevImages => prevImages.filter(image => image.id !== imageId));

        setMenu(null);
    }

    const handleMetaDataChange = (field: keyof SelectedImageMetadata, value:string) => {
        if (selectedImage) {
            setSelectedImage({
                ...selectedImage,
                [field]: value,
            });
        }
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
        try {
            const response = await fetch(`${APIURL}/api/users/`, {  // Replace with api
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appliedImages),
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

    const deleteFromDatabase = async(id: number) => {
        const response = await fetch(`${APIURL}/api/users?id=${id}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id}),
        });

        if (response.ok) {
            console.log('Image positions deleted successfully');
        }
    }

    // Update the image url, x, y
    const updateDatabase = async(id: number) => {
        // example for now
        // const current = users.find((u) => u.id === id);
        // if (!current) return;
  
        // const newStatus = current.lineStatus === 'online' ? 'offline' : 'online';
  
        // const res = await fetch(`${APIURL}/api/users?id=${id}`, {
        //     method: 'PATCH',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ ...current, lineStatus: newStatus }),
        // });
  
        // if (res.ok) {
        //     fetchUsers(); // 🔁 Refetch after update
        // }
    }

    const loadFromDatabase = async() => {
        // Later
    }

    const handleExport = () => {
        // Pass the two necessary pieces of state to the external function
        generateHTMLFile(appliedImages, timeLimitSeconds);
    };

    return (
        <div>
            <div className={styles.uploader_controls}>
                <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    ref={fileInputRef}
                />
            </div>

            {selectedImage && (
                <>
                    <div className={styles.image_header_container}>
                        <h2>Selected Image:</h2>
                        <button
                            onClick={clearImage}
                            className={styles.clear_button}
                        >
                            Clear Image
                        </button>
                    </div>
                    <div className={styles.image_display_container}>
                        <img
                            src={selectedImage.url}
                            alt="Selected"
                            className={styles.thumbnail_image}
                        />
                    </div>

                    <div className={styles.metadata_inputs}>
                        <label htmlFor="hintText">Hint Text:</label>
                        <input
                            id="hintText"
                            type="text"
                            value={selectedImage.hintText}
                            onChange={(e) => handleMetaDataChange('hintText', e.target.value)}
                            placeholder='Enter hint for the image'
                        />

                        <label htmlFor="clueText">Clue Text:</label>
                        <input
                            id="clueText"
                            type="text"
                            value={selectedImage.clueText}
                            onChange={(e) => handleMetaDataChange('clueText', e.target.value)}
                            placeholder='Enter the clue associated with this image'
                        />

                        <label htmlFor="answer">Answer:</label>
                        <input
                            id="answer"
                            type="text"
                            value={selectedImage.answer}
                            onChange={(e) => handleMetaDataChange('answer', e.target.value)}
                            placeholder='En ter the correct answer'
                        />
                    </div>

                    <button
                        onClick={applyImage}
                        className={styles.apply_button}
                        disabled={appliedImages.length >= 3}
                    >
                        Apply Image
                    </button>
                </>
            )}

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
                />
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