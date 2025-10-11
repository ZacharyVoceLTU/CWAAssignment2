'use client'

import React, { useState, useRef, ChangeEvent } from 'react';
import styles from '@/components/imageuploader/imageuploader.module.css';
import ImageMenu from '../imageMenu/imageMenu';

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

interface SelectedImageMetadata {
    url: string;
    hintText: string;
    clueText: string;
    answer: string;
    fileName: string
}

const APIURL = "http://ec2-54-83-190-191.compute-1.amazonaws.com";

const ImageUploader: React.FC = () => {
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

// imageuploader.tsx

const generateHTMLFile = () => {
    if (appliedImages.length === 0) {
        alert("Please apply at least one image before exporting.");
        return;
    }

    // Recommended Folder Structure:
    // - exported_room/
    //   - escape_room_layout.html (This file)
    //   - assets/images/ (Where user must manually place the files)

    // The exported HTML will reference images from 'assets/images/filename.png'
    const IMAGE_PATH_PREFIX = 'assets/images/'; 

    // --- 1. Generate the HTML/CSS for the individual images ---
    const imageElements = appliedImages.map(image => `
<img 
    src="${IMAGE_PATH_PREFIX}${image.fileName}" alt="Escape Room Element: ${image.fileName}"
    class="applied-image"
    style="
        position: absolute;
        left: ${image.x}px;
        top: ${image.y}px;  
        width: 150px; 
        height: auto;
        cursor: pointer;
    "
    data-hint="${image.hintText}"
    data-clue="${image.clueText}"
    data-answer="${image.answer}"
>
    `).join('');

    // --- 2. Construct the full HTML document ---
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Exported Escape Room Layout</title>
    <style>
        body {
            /* Use the same relative path for the background */
            background-image: url('${IMAGE_PATH_PREFIX}background_image.jpg'); 
            background-size: cover;
            background-repeat: no-repeat;
            width: 100vw;
            height: 100vh;
            margin: 0;
            position: relative;
        }
        /* ... rest of the CSS ... */
    </style>
</head>
<body>
    ${imageElements}
    
    <div style="position:fixed; top:10px; right:10px; background:white; padding:10px; border:1px solid red; font-size:12px;">
        <h2>IMPORTANT: File Setup</h2>
        <p>For this file to work, you must create a folder named <strong>'assets/images/'</strong> next to this HTML file and place all original images (including the background) inside it.</p>
        <p><strong>Required Files:</strong></p>
        <ul>
            ${appliedImages.map(img => `<li>${img.fileName}</li>`).join('')}
            <li>background_image.jpg (or whatever your background file is named)</li>
        </ul>
    </div>
</body>
</html>
    `;

    // --- 3. Create a Blob and trigger download ---
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'escape_room_layout.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                            placeholder='Enter the correct answer'
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
            <button onClick={generateHTMLFile} className={styles.export_button}>
                Export HTML File
            </button>
        </div>
    );
};

export default ImageUploader;