// app/escaperoom/page.tsx
'use client'

import { useState } from 'react';

import Timer from '@/components/timer/timer'
import ImageUploader from '@/components/imageuploader/imageuploader'
import styles from './page.module.css'

export default function EscapeRoom() {
    const [timeLimitSeconds, setTimeLimitSeconds] = useState(30);
    // TODO: Get Footer back
    return (
        <div className={styles.escapeRoomContainer}>
            <div className={styles.uiLayer}>
                <div className={styles.topContainer}>
                    <ImageUploader
                        timeLimitSeconds={timeLimitSeconds}
                    />
                    <Timer
                        initialTime={timeLimitSeconds}
                        setInitialTime={setTimeLimitSeconds}
                    />
                </div>
            </div>
        </div>
    )
}