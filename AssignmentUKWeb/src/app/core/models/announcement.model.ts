export interface Announcement {
  id: string;
  message: string;
  isActive: boolean;
  createdDate: string;
}

export interface CreateAnnouncementRequest {
  message: string;
  isActive: boolean;
}

export interface UpdateAnnouncementRequest {
  message: string;
  isActive: boolean;
}
