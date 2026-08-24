export interface EnquiryStatusOption {
  id: string;
  name: string;
  colorHex: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateEnquiryStatusRequest {
  name: string;
  colorHex: string;
}

export interface UpdateEnquiryStatusRequest {
  name: string;
  colorHex: string;
  isActive: boolean;
}
