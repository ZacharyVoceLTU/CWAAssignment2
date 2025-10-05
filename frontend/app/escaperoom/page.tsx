// app/escaperoom/page.tsx
'use client'

import Timer from '@/components/timer/timer'
import ImageUploader from '@/components/imageuploader/imageuploader'
import styles from './page.module.css'

export default function EscapeRoom() {
    return (
        <div className={styles.escapeRoomContainer}>
            <div className={styles.backgroundLayer}></div>
            <div className={styles.uiLayer}>
                <div className={styles.topContainer}>
                    <ImageUploader/>
                    <Timer/>
                </div>
            </div>
        </div>
    )
}