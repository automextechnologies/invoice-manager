import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadToDrive = async (filePath, fileName) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, '../', process.env.GOOGLE_APPLICATION_CREDENTIALS || 'service-account.json'),
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata = {
            name: fileName,
            parents: [process.env.DRIVE_FOLDER_ID],
        };

        const media = {
            mimeType: 'application/pdf',
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading to Drive:', error);
        throw error;
    }
};
