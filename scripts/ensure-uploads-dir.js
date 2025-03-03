const fs = require('fs').promises;
const path = require('path');

async function ensureUploadsDirectory() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(uploadsDir);
    console.log('Uploads directory already exists.');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Creating uploads directory...');
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log('Uploads directory created successfully.');
    } else {
      console.error('Error checking uploads directory:', error);
    }
  }
}

ensureUploadsDirectory();

