
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceImage = 'C:/Users/Gashi/.gemini/antigravity/brain/d27b8a27-f667-46f2-bd81-13d9ab380d0a/uploaded_image_1767302117019.png';
const outputDir = './src/assets/sub_agents/';

// Ensure output dir exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function splitImage() {
    try {
        const image = sharp(sourceImage);
        const metadata = await image.metadata();

        const width = metadata.width;
        const height = metadata.height;

        const rows = 6;
        const cols = 5;

        const cellWidth = Math.floor(width / cols);
        const cellHeight = Math.floor(height / rows);

        console.log(`Image dimensions: ${width}x${height}`);
        console.log(`Cell dimensions: ${cellWidth}x${cellHeight}`);

        let count = 0;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                count++;
                // Skip if we go beyond likely icon count (user passed 29, grid is 30)
                if (count > 30) break;

                const left = c * cellWidth;
                const top = r * cellHeight;

                const outputPath = path.join(outputDir, `robot_sub_${count}.png`);

                await image
                    .clone()
                    .extract({ left, top, width: cellWidth, height: cellHeight })
                    .toFile(outputPath);

                console.log(`Saved ${outputPath}`);
            }
        }
        console.log('Done splitting images!');

    } catch (err) {
        console.error("Error processing image:", err);
    }
}

splitImage();
