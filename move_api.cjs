const fs = require('fs');
const path = require('path');

const dirs = ['routes', 'controllers', 'models', 'services', 'config', 'templates', 'temp'];
const src = 'api';
const dest = 'api/_src';

if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
}

dirs.forEach(dir => {
    const oldPath = path.join(src, dir);
    const newPath = path.join(dest, dir);
    if (fs.existsSync(oldPath)) {
        try {
            fs.renameSync(oldPath, newPath);
            console.log(`Moved ${oldPath} to ${newPath}`);
        } catch (err) {
            console.error(`Failed to move ${oldPath}: ${err.message}`);
        }
    }
});
