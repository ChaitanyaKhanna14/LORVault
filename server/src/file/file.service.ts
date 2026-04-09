import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private supabase: SupabaseClient;
  private bucket: string;
  private readonly logger = new Logger(FileService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
    this.bucket = this.configService.get<string>('SUPABASE_BUCKET') || 'lors';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async saveOriginalPdf(buffer: Buffer, originalFilename: string): Promise<string> {
    const filename = `originals/${uuidv4()}.pdf`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filename, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      this.logger.error(`Failed to upload original PDF: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return filename;
  }

  async saveCanonicalPdf(buffer: Buffer, lorId: string): Promise<string> {
    const filename = `canonical/${lorId}.pdf`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filename, buffer, {
        contentType: 'application/pdf',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      this.logger.error(`Failed to upload canonical PDF: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return filename;
  }

  async readPdf(relativePath: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(relativePath);

    if (error || !data) {
      this.logger.error(`Failed to download PDF: ${error?.message}`);
      throw new NotFoundException('PDF file not found');
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async deletePdf(relativePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([relativePath]);

    if (error) {
      // Log but don't throw - file might not exist
      this.logger.warn(`Failed to delete PDF: ${error.message}`);
    }
  }

  // Get a signed URL for direct download (optional - for better performance)
  async getSignedUrl(relativePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(relativePath, expiresIn);

    if (error || !data?.signedUrl) {
      throw new NotFoundException('Could not generate download URL');
    }

    return data.signedUrl;
  }
}
