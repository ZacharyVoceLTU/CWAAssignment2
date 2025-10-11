// app/escaperoom/page.tsx
'use client'

import Timer from '@/components/timer/timer'
import ImageUploader from '@/components/imageuploader/imageuploader'
import styles from './page.module.css'

export default function EscapeRoom() {
    // TODO: Get Footer back
    return (
        <div className={styles.escapeRoomContainer}>
            <div className={styles.uiLayer}>
                <div className={styles.topContainer}>
                    <ImageUploader/>
                    {/*<Timer/>*/}
                </div>
            </div>
        </div>
    )
}