require('dotenv').config();
const cloudinary = require('../utils/cloudinaryConfig');
const path = require('path');

const images = [
    { name: 'bed_linen', path: 'C:/Users/tharu/.gemini/antigravity/brain/02f36acd-bffa-4574-bbe8-4e7fa3404dc1/bed_linen_seed_1769978225129.png' },
    { name: 'towels', path: 'C:/Users/tharu/.gemini/antigravity/brain/02f36acd-bffa-4574-bbe8-4e7fa3404dc1/towels_seed_1769978240310.png' },
    { name: 'pillows', path: 'C:/Users/tharu/.gemini/antigravity/brain/02f36acd-bffa-4574-bbe8-4e7fa3404dc1/pillows_seed_1769978255929.png' },
    { name: 'blankets', path: 'C:/Users/tharu/.gemini/antigravity/brain/02f36acd-bffa-4574-bbe8-4e7fa3404dc1/blankets_seed_1769978272722.png' },
    { name: 'home_decor', path: 'C:/Users/tharu/.gemini/antigravity/brain/02f36acd-bffa-4574-bbe8-4e7fa3404dc1/home_decor_seed_1769978288308.png' }
];

const uploadImages = async () => {
    console.log('Starting Cloudinary uploads...');
    const results = {};

    for (const img of images) {
        try {
            console.log(`Uploading ${img.name}...`);
            const result = await cloudinary.uploader.upload(img.path, {
                folder: 'bombay-dyeing-seed',
                public_id: img.name,
                overwrite: true
            });
            results[img.name] = result.secure_url;
            console.log(`✅ ${img.name}: ${result.secure_url}`);
        } catch (error) {
            console.error(`❌ Failed to upload ${img.name}:`, error.message);
        }
    }

    console.log('\n--- Final Cloudinary URLs ---');
    console.log(JSON.stringify(results, null, 2));
    process.exit();
};

uploadImages();
