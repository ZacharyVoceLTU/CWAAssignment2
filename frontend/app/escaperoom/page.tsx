'use client'

import Timer from '@/components/timer/timer'
import ImageUploader from '@/components/imageuploader/imageuploader'
import styles from './page.module.css'

export default function EscapeRoom() {
    

    return (
        <div className={styles.background_container}>
            <div className={styles.background}>
                <div className={styles.topContainer}>
                    <Timer/>
                    <ImageUploader/>
                </div>
            </div>
        </div>
    )
}