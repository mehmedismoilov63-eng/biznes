import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { rename } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const STORAGE_ROOT = "storage";
const UPLOAD_ROOT = join(STORAGE_ROOT, "uploads");
const MESSAGE_UPLOAD_DIR = join(UPLOAD_ROOT, "messages");
const AVATAR_UPLOAD_DIR = join(UPLOAD_ROOT, "avatars");
const ADMIN_VIDEO_UPLOAD_DIR = join(UPLOAD_ROOT, "admin-videos");
const TOKEN_BYTES = 8;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MAX_MESSAGE_MEDIA_BYTES = 25 * 1024 * 1024;
const MAX_ADMIN_VIDEO_BYTES = 500 * 1024 * 1024;

type UploadKind = "avatar" | "message" | "admin-video";

type UploadedDiskFile = {
  originalname: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
};

type UploadResponse = {
  path: string;
  originalName: string;
  mimeType: string;
  size: number;
};

mkdirSync(MESSAGE_UPLOAD_DIR, { recursive: true });
mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
mkdirSync(ADMIN_VIDEO_UPLOAD_DIR, { recursive: true });

@Controller("uploads")
export class UploadsController {
  @Post("message-media")
  @UseInterceptors(FileInterceptor("file", { dest: MESSAGE_UPLOAD_DIR, limits: { fileSize: MAX_MESSAGE_MEDIA_BYTES } }))
  async uploadMessageMedia(@UploadedFile() file?: UploadedDiskFile): Promise<UploadResponse> {
    return this.persist(file, "message", MESSAGE_UPLOAD_DIR);
  }

  @Post("avatar")
  @UseInterceptors(FileInterceptor("file", { dest: AVATAR_UPLOAD_DIR, limits: { fileSize: MAX_AVATAR_BYTES } }))
  async uploadAvatar(@UploadedFile() file?: UploadedDiskFile): Promise<UploadResponse> {
    return this.persist(file, "avatar", AVATAR_UPLOAD_DIR);
  }

  @Post("admin-video")
  @UseInterceptors(FileInterceptor("file", { dest: ADMIN_VIDEO_UPLOAD_DIR, limits: { fileSize: MAX_ADMIN_VIDEO_BYTES } }))
  async uploadAdminVideo(@UploadedFile() file?: UploadedDiskFile): Promise<UploadResponse> {
    return this.persist(file, "admin-video", ADMIN_VIDEO_UPLOAD_DIR);
  }

  private async persist(file: UploadedDiskFile | undefined, kind: UploadKind, directory: string): Promise<UploadResponse> {
    if (!file) throw new BadRequestException("Fayl yuborilmadi");
    this.assertAllowed(file, kind);

    const safeName = this.createSafeFileName(file.originalname);
    const finalPath = join(directory, safeName);
    await rename(file.path, finalPath);

    return {
      path: this.toPublicPath(finalPath),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  private assertAllowed(file: UploadedDiskFile, kind: UploadKind): void {
    if (kind === "avatar" && !file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Avatar uchun rasm fayl kerak");
    }

    if (kind === "admin-video" && !file.mimetype.startsWith("video/")) {
      throw new BadRequestException("Admin upload uchun video fayl kerak");
    }

    if (kind === "message" && !["image/", "audio/", "video/"].some((prefix) => file.mimetype.startsWith(prefix))) {
      throw new BadRequestException("Xabar uchun image/audio/video fayl kerak");
    }
  }

  private createSafeFileName(originalName: string): string {
    const extension = extname(originalName).toLowerCase();
    const name = basename(originalName, extension)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const token = randomBytes(TOKEN_BYTES).toString("hex");

    return `${name || "file"}-${token}${extension}`;
  }

  private toPublicPath(filePath: string): string {
    return `/${filePath.replace(/\\/g, "/")}`;
  }
}
