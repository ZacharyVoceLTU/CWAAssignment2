// components/timer/timer.tsx
import React, {useState, useEffect} from 'react';

// --- NEW PROPS INTERFACE ---
interface TimerProps {
    initialTime: number;
    setInitialTime: (time: number) => void;
}
// ---------------------------

// Update component signature
const Timer: React.FC<TimerProps> = ({ initialTime, setInitialTime }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Use the prop setter to update the state in the parent (page.tsx)
        setInitialTime(Number(e.target.value));
    }

    return (
        <div>
            <input
                type="number"
                value={initialTime}
                onChange={handleInputChange}
                placeholder="Set time in seconds"
            />
        </div>
    )
}

export default Timer;