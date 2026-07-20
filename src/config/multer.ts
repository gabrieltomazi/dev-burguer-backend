import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { v4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
	storage: multer.diskStorage({
		destination: resolve(__dirname, '..', '..', 'uploads'),
		filename: (_request, file, callback) => {
			const uniqueName = `${v4()}-${file.originalname}`;
			return callback(null, uniqueName);
		},
	}),
};
