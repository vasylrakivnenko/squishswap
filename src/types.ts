export interface Student {
  id: string;
  name: string; // e.g. "Katie P."
  classroom: string; // e.g. "Room 14 · 4th Grade"
  avatarSeed: string;
  isOnline: boolean;
  lastActive: number;
}

export interface SquishyItem {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerClassroom: string;
  name: string;
  color: string;
  texture: string;
  condition: 'Like New' | 'Gently Squished' | 'Well Loved';
  wishlist: string;
  imageUrl: string;
  status: 'available' | 'trade_pending' | 'traded';
  createdAt: number;
  isOwnerOnline?: boolean;
}

export interface TradeOffer {
  id: string;
  fromStudentId: string;
  fromStudentName: string;
  fromStudentClassroom: string;
  offeredSquishyId: string;
  offeredSquishyName: string;
  offeredSquishyImageUrl: string;

  toStudentId: string;
  toStudentName: string;
  targetSquishyId: string;
  targetSquishyName: string;
  targetSquishyImageUrl: string;

  status: 'pending' | 'accepted' | 'declined';
  presetMessage: string;
  responseNote?: string;
  createdAt: number;
}

export interface AIInspectionResult {
  isSquish: boolean;
  cleanBackground: boolean;
  status: 'approved' | 'not_a_squish' | 'background_clutter';
  message: string;
  detectedColor?: string;
  detectedCondition?: 'Like New' | 'Gently Squished' | 'Well Loved';
  detectedTexture?: string;
  suggestedName?: string;
  verifiedBy?: string;
}
