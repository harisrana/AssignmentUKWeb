import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { FileUploadResult } from '../models/file.model';

/** Generic single-file upload, saved to local disk on the server. */
@Injectable({ providedIn: 'root' })
export class FileService extends BaseApiService {
  upload(file: File): Observable<FileUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<FileUploadResult>(API_ENDPOINTS.files.upload, formData);
  }
}
