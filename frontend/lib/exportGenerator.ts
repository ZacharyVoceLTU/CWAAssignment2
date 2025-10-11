// lib/exportGenerator.ts

// The interface definition is required here to ensure the function is self-contained and correctly typed.
interface AppliedImage {
    id: number;
    url: string; 
    x: number;
    y: number;
    hintText: string;
    clueText: string;
    answer: string;
    fileName: string; 
}

/**
 * Generates the playable HTML file for the escape room layout and triggers a download.
 * @param appliedImages The list of images with their coordinates and game data.
 */
export const generateHTMLFile = (appliedImages: AppliedImage[]) => {
    if (appliedImages.length === 0) {
        alert("Please apply at least one image before exporting.");
        return;
    }

    const IMAGE_PATH_PREFIX = 'assets/images/'; 
    const totalPuzzles = appliedImages.length; // Determine total puzzles

    // --- 1. Generate the HTML/CSS for the individual interactive elements ---
    const imageElements = appliedImages.map(image => `
<div 
    id="container-${image.id}"
    class="image-interactive-container"
    style="
        position: absolute;
        left: ${image.x}px; 
        top: ${image.y}px;  
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 150px; /* Container width */
    "
    data-answer="${image.answer.trim().toLowerCase()}"
    data-hint="${image.hintText}"
    data-clue="${image.clueText}"
    data-solved="false" >
    <img 
        id="img-${image.id}"
        src="${IMAGE_PATH_PREFIX}${image.fileName}"
        alt="Escape Room Element: ${image.fileName}"
        class="applied-image"
        style="
            width: 100%;
            height: auto;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            margin-bottom: 5px;
        "
    >
    <input 
        type="text" 
        id="input-${image.id}" 
        placeholder="Enter your answer" 
        class="answer-input"
    >
    <button onclick="checkAnswer(${image.id})" class="check-button">
        Check Answer
    </button>
</div>
    `).join('');

    // --- 2. Define the JavaScript logic for the game ---
    const gameScript = `
// Global variable to track the total number of puzzles
const TOTAL_PUZZLES = ${totalPuzzles};

// Function to check if all puzzles are solved
function checkWinCondition() {
    const solvedCount = document.querySelectorAll('[data-solved="true"]').length;
    
    if (solvedCount === TOTAL_PUZZLES) {
        // Show the win screen and stop the game
        document.getElementById('win-screen').style.display = 'flex';
        // Optional: Hide all answer inputs/buttons if desired
    }
}

function checkAnswer(id) {
    const container = document.getElementById('container-' + id);
    const input = document.getElementById('input-' + id);
    const img = document.getElementById('img-' + id);
    
    // Check if already solved
    if (container.getAttribute('data-solved') === 'true') {
        return; 
    }

    // Get stored data
    const correctAnswer = container.getAttribute('data-answer');
    const playerAnswer = input.value.trim().toLowerCase();
    const clueText = container.getAttribute('data-clue');
    
    // Check answer
    if (playerAnswer === correctAnswer) {
        alert('🎉 Correct! You found the clue: ' + clueText);
        img.style.border = '4px solid green';
        input.disabled = true;
        
        // --- WIN LOGIC ---
        container.setAttribute('data-solved', 'true'); // Mark this puzzle as solved
        checkWinCondition(); // Check if the game is over
        // ---------------
    } else {
        alert('❌ Incorrect. Try again or look for a hint.');
        img.style.border = '4px solid red';
    }
}

// Optional: Show hint on image click
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.applied-image').forEach(img => {
        img.addEventListener('click', () => {
            const container = img.parentElement;
            const hint = container.getAttribute('data-hint');
            alert('💡 Hint: ' + hint);
        });
    });
});
    `;

    // --- 3. Construct the full HTML document ---
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Exported Escape Room Layout</title>
    <style>
        body {
            /* Clean background, no image reference */
            background-color: white; 
            width: 100vw;
            height: 100vh;
            margin: 0;
            position: relative;
            font-family: sans-serif;
        }
        .image-interactive-container {
            transition: transform 0.2s;
        }
        .applied-image {
            transition: border 0.3s;
        }
        .answer-input, .check-button {
            width: 90%;
            margin-top: 2px;
            padding: 5px;
            box-sizing: border-box;
        }
        /* --- WIN SCREEN STYLE --- */
        #win-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            font-size: 40px;
            display: none; /* Starts hidden */
            justify-content: center;
            align-items: center;
            text-align: center;
            z-index: 10000;
            flex-direction: column;
        }
    </style>
</head>
<body>
    ${imageElements}
    
    <script>
        ${gameScript}
    </script>

    <div id="win-screen">
        <h1>CONGRATULATIONS!</h1>
        <p>You have solved all ${totalPuzzles} puzzles and escaped the room!</p>
        <p style="font-size: 20px;">🎉 Victory! 🎉</p>
    </div>

    <div style="position:fixed; top:10px; right:10px; background:white; padding:15px; border:2px solid #333; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
        <h2>Game Instructions</h2>
        <p>1. Click any image to reveal its hint (if provided).</p>
        <p>2. Type your answer in the field and click 'Check Answer'.</p>
        <p>3. Correct answers turn the image border green and reveal the final clue.</p>
        <p style="color:red; font-weight:bold;">🚨 Remember: Place all puzzle images in a subfolder named 'assets/images/' next to this HTML file.</p>
    </div>
</body>
</html>
    `;

    // --- 4. Create a Blob and trigger download ---
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'escape_room_layout.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};