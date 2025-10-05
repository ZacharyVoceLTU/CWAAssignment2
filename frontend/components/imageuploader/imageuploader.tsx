'use client'

import React, { useState, useRef, ChangeEvent } from 'react';
import styles from '@/components/imageuploader/imageuploader.module.css';

interface AppliedImage {
    id: number;
    url: string;
    x: number;
    y: number;
}

const ImageUploader: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [appliedImages, setAppliedImages] = useState<AppliedImage[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draggingImageId, setDraggingImageId] = useState<number | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
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
                url: selectedImage,
                x: 0, // Initial position
                y: 0, // Initial position
            };
            setAppliedImages([...appliedImages, newImage]);
            clearImage();
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
                            src={selectedImage}
                            alt="Selected"
                            className={styles.thumbnail_image}
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
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageUploader;