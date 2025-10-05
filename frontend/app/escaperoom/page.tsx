'use client'

import Timer from '@/components/timer/timer'
import styles from './page.module.css'

export default function EscapeRoom() {
    return (
        <>
            <div className={styles.background}> Hello </div>
            <Timer></Timer>
        </>
    )
}