'use client'

import React, {useState, useRef, ChangeEvent} from 'react';
import styles from '@/components/imageuploader/imageuploader.module.css'

interface AppliedImage {
    id: number;
    url: string;
}

const ImageUploader: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [appliedImages, setAppliedImages] = useState<AppliedImage[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Check if file was selected
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
        }
    };

    const applyImage = () => {
        if (selectedImage && appliedImages.length < 3) {
            const newImage: AppliedImage = {
                id: Date.now(), // Unique ID
                url: selectedImage
            };
            setAppliedImages([...appliedImages, newImage]);
            clearImage();
        }
    };

    const clearImage = () => {
        setSelectedImage(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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
                </>
            )}
        </div>
    );
};

export default ImageUploader;