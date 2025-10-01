'use client';

import {useState} from 'react';
import styles from './hamburgerMenu.module.css' 

interface HamburgerMenuProps {
    changeTheme: (theme: string) => void;
}

export default function HamburgerMenu({changeTheme} : HamburgerMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }

    return (
        <>
            <div className={styles.container}   >
                <div className={styles.hamburger} onClick={toggleMenu}>
                    <div className={isOpen ? styles.barOpen : styles.bar}></div>
                    <div className={isOpen ? styles.barOpen : styles.bar}></div>
                    <div className={isOpen ? styles.barOpen : styles.bar}></div>
                </div>
                <div className={isOpen ? styles.menuOpen : styles.menu}>
                    <ul>
                        <li onClick={() => { changeTheme("light"); setIsOpen(false);}}>light</li>
                        <li onClick={() => { changeTheme("dark"); setIsOpen(false);}}>dark</li>
                        <li onClick={() => { changeTheme("purple"); setIsOpen(false);}}>purple</li>
                    </ul>
                </div>
            </div>
        </>
    )
}