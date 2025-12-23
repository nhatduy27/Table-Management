// utils/imageProcessor.js
import sharp from 'sharp';

class ImageProcessor {
    static async processMenuItemImage(buffer) {
        const sizes = {
            original: { width: null, height: null }, // Giữ nguyên
            large: { width: 1200, height: 800 },
            medium: { width: 600, height: 400 },
            thumbnail: { width: 200, height: 200 }
        };

        const processedImages = {};

        // Xử lý từng kích thước
        for (const [size, dimensions] of Object.entries(sizes)) {
            let image = sharp(buffer);
            
            if (dimensions.width && dimensions.height) {
                image = image.resize(dimensions.width, dimensions.height, {
                    fit: 'cover',
                    position: 'center'
                });
            }

            // Optimize ảnh
            image = image.jpeg({ 
                quality: size === 'original' ? 90 : 80,
                progressive: true 
            });

            processedImages[size] = await image.toBuffer();
        }

        return processedImages;
    }

    static async getImageMetadata(buffer) {
        const metadata = await sharp(buffer).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: buffer.length
        };
    }
}

module.exports = ImageProcessor;