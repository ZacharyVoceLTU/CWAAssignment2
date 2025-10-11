'use client'

import React from 'react';
import styles from './imageMenu.module.css'

interface ImageMenuProps {
    image: any;
    x: number;
    y: number;
    onClose: () => void;
    onDelete: (imageId: number) => void;
}

const ImageMenu: React.FC<ImageMenuProps> = ({image, x, y, onClose, onDelete}) => {
    // Position menu based on double click coordinates
    const menuStyle: React.CSSProperties = {
        position: 'absolute',
        left: x + 'px',
        top: y + 'px',
        zIndex: 1000,
    };

    // Prevent the click inside the meny from closing it immediately
    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    const handleDeleteClick = () => {
        onDelete(image.id);
    }

    return (
        <div
            className={styles.imageMenu}
            style={menuStyle}
            onClick={handleMenuClick}
        >
            <div className={styles.menuItem}>
                Options for Image ID: {image.id}
            </div>
            <div className={styles.menuItem}>
                <button onClick={() => {console.log('Edit clicked'); onClose();}}>Edit</button>
            </div>
            <div className={styles.menuItem}>
                <button onClick={handleDeleteClick}>Delete</button>
            </div>

            <div className={styles.closeMenuItem}>
                <button onClick={onClose} className={styles.closebutton}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default ImageMenu;