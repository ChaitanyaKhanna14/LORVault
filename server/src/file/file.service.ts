import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
  }

  async saveOriginalPdf(buffer: Buffer, originalFilename: string): Promise<string> {
    const dir = path.join(this.uploadDir, 'originals');
    await fs.mkdir(dir, { recursive: true });

    const filename = `${uuidv4()}.pdf`;
    const filepath = path.join(dir, filename);

    await fs.writeFile(filepath, buffer);

    return `originals/${filename}`;
  }

  async saveCanonicalPdf(buffer: Buffer, lorId: string): Promise<string> {
    const dir = path.join(this.uploadDir, 'canonical');
    await fs.mkdir(dir, { recursive: true });

    const filename = `${lorId}.pdf`;
    const filepath = path.join(dir, filename);

    await fs.writeFile(filepath, buffer);

    return `canonical/${filename}`;
  }

  async readPdf(relativePath: string): Promise<Buffer> {
    const filepath = path.join(this.uploadDir, relativePath);

    try {
      return await fs.readFile(filepath);
    } catch (error) {
      throw new NotFoundException('PDF file not found');
    }
  }

  async deletePdf(relativePath: string): Promise<void> {
    const filepath = path.join(this.uploadDir, relativePath);

    try {
      await fs.unlink(filepath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }
}
