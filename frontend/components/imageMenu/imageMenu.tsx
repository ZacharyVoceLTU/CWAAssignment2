'use client'

import React, { useState } from 'react';
import styles from './imageMenu.module.css'

interface ImageMenuProps {
    image: any;
    x: number;
    y: number;
    onClose: () => void;
    onDelete: (imageId: number) => void;
    onUpdateMetadata: (imageId: number, metadata: UpdatedMetadata) => void;
    onFlip: (imageId: number) => void;
}

interface UpdatedMetadata {
    hintText: string;
    clueText: string;
    answer: string;
}

const ImageMenu: React.FC<ImageMenuProps> = ({image, x, y, onClose, onDelete, onUpdateMetadata, onFlip}) => {
    // Position menu based on double click coordinates
    const menuStyle: React.CSSProperties = {
        position: 'absolute',
        left: x + 'px',
        top: y + 'px',
        zIndex: 1000,
    };

    const [metadata, setMetadata] = useState<UpdatedMetadata>({
        hintText: image.hintText || '',
        clueText: image.clueText || '',
        answer: image.answer || '',
    });

    // Prevent the click inside the meny from closing it immediately
    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    const handleDeleteClick = () => {
        onDelete(image.id);
    }

    const handleInputChange = (field: keyof UpdatedMetadata, value: string) => {
        setMetadata(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        onUpdateMetadata(image.id, metadata);
        onClose(); // Close menu after saving
    }

    const handleFlipClick = () => {
        onFlip(image.id);
        // Note: Menu remains open after flip
    }

    return (
        <div 
            className={styles.imageMenu}
            style={menuStyle}
            onClick={handleMenuClick}
        >
            <h3>Edit Image Metadata</h3>
            
            {/* --- Metadata Inputs --- */}
            <div className={styles.inputGroup}>
                <label htmlFor="hintText">Hint Text:</label>
                <input
                    id="hintText"
                    type="text"
                    value={metadata.hintText}
                    onChange={(e) => handleInputChange('hintText', e.target.value)}
                />
            </div>
            
            <div className={styles.inputGroup}>
                <label htmlFor="clueText">Clue Text:</label>
                <input
                    id="clueText"
                    type="text"
                    value={metadata.clueText}
                    onChange={(e) => handleInputChange('clueText', e.target.value)}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="answer">Answer:</label>
                <input
                    id="answer"
                    type="text"
                    value={metadata.answer}
                    onChange={(e) => handleInputChange('answer', e.target.value)}
                />
            </div>

            <hr />
            
            {/* --- Action Buttons --- */}
            <div className={styles.menuActions}>
                <button 
                    onClick={handleFlipClick} 
                    className={styles.flipButton} // 💡 Add .flipButton to your CSS
                >
                    {image.isFlipped ? 'Unflip Image' : 'Flip Image'}
                </button>

                <button onClick={handleSave} className={styles.saveButton}>
                    Save Changes
                </button>
                
                <button onClick={handleDeleteClick} className={styles.deleteButton}>
                    Delete
                </button>
                
                <button onClick={onClose} className={styles.closeButton}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default ImageMenu;