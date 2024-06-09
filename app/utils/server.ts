import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const handleFileUpload = async (avatarFile: File) => {
  let avatarPath = null;
  if (avatarFile && avatarFile instanceof File) {
    const fileName = `${Date.now()}-${avatarFile.name}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    avatarPath = `/uploads/${fileName}`;
  }
  return avatarPath;
};
