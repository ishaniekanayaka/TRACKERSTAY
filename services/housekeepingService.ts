import api from '../config/apiConfig';

/**
 * housekeepingService.ts
 * 
 * This service handles all API interactions for the housekeeping checklist flow.
 * Aligned with the provided Checklist API documentation.
 */

// ─── Basic Interfaces ─────────────────────────────────────────────────────────

export interface RoomCategory {
  id: number;
  category: string;
  custome_name: string;
  room_type: string;
  status: string;
  price: number;
  num_of_bed: number;
  max_adults_limit: number;
  max_children_limit: number;
  image: string | null;
}

export interface Housekeeper {
  id: number;
  name: string;
  lname?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface Room {
  id: number;
  room_number: string;
  room_type?: string;
  hotel_id?: number;
  reapair?: string | null;
  is_visible?: number;
  check_list_layout_id?: number;
  created_at?: string;
  updated_at?: string;
  room_category?: RoomCategory;
  check_list?: CheckList | null;
  // Booking info injected from calendar API
  current_booking?: {
    booking_id: number;
    guest_name: string;
    start_date: string;
    end_date: string;
    status: string;
  } | null;
}

export interface CheckList {
  id: number;
  room_id: number;
  status: 'Pending' | 'Checked' | string;
  room_status: 'Ready' | 'Not Ready' | string;
  housekeeper_id: number;
  supervisor_id: number | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  housekeeper: Housekeeper | null;
  supervisor: Housekeeper | null;
}

export interface OtherLocation {
  id: number;
  name: string;
  category: string;
  check_list_layout_id: string | number;
  duration: string;
  frequency: string;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomsResponse {
  status: boolean;
  message: string;
  rooms: Room[];
  other_locations?: OtherLocation[];
}

// ─── Checklist Detail / Image Interfaces ──────────────────────────────────────

export interface ChecklistDetailItem {
  id: number;
  housekeeping_id: number;
  housekeeper_status: string | null;
  supervisor_status: string | null;
  reason: string | null;
  housekeeping: {
    id: number;
    item_name: string;
    check_list_layout_id?: number;
    status?: string | null;
  };
}

export interface ChecklistImage {
  id: number;
  image: string;
  image_url: string;
}

export interface RoomChecklist {
  id: number;
  room_id: number;
  status: string;
  room_status: string;
  housekeeper_id: number;
  supervisor_id: number | null;
  created_at: string;
  updated_at: string;
  housekeeper: Housekeeper | null;
  supervisor: Housekeeper | null;
  room: {
    id: number;
    room_number: string;
    room_type?: string;
  };
  check_list_detail: ChecklistDetailItem[];
  check_list_image: ChecklistImage[];
}

// ─── Template Interfaces ──────────────────────────────────────────────────────

export interface TemplateHousekeepingItem {
  id: number;
  item_name: string;
  check_list_layout_id: number;
}

export interface ChecklistTemplate {
  room: {
    id: number;
    room_number: string;
    check_list_layout_id: number;
  };
  housekeeping_items: TemplateHousekeepingItem[];
}

// ─── Finalize Template Interfaces ─────────────────────────────────────────────

export interface RefillingItemDetail {
  id: number;
  unit: string;
  item: string;
  quantity: string;
  unit_price: number;
  hotel_id: string;
}

export interface RefillingItem {
  id: number;
  check_list_layout_id: string;
  item_id: string;
  status: string | null;
  item: RefillingItemDetail;
}

export interface JanitorialItemDetail {
  id: number;
  unit: string;
  item: string;
  quantity: string;
  unit_price: number;
  hotel_id: string;
}

export interface JanitorialItem {
  id: number;
  check_list_layout_id: string;
  item_id: string;
  status: string | null;
  item: JanitorialItemDetail;
}

export interface FinalizeTemplate {
  room: {
    id: number;
    room_number: string;
  };
  checklist: RoomChecklist;
  janitorial_items: JanitorialItem[];
  refilling_items: RefillingItem[];
}

// ─── Save Payload Interfaces ──────────────────────────────────────────────────

export interface SaveChecklistPayload {
  location_id: number;
  type: 'room' | 'other';
  check_list_items: { housekeeping_id: number; status: 'Yes' | 'No' }[];
  images?: { uri: string; name: string; type: string }[];
}

export interface FinalizeItem {
  detail_id: number;
  supervisor_status: 'Yes' | 'No';
  reason?: string;
}

export interface RefillingUsageItem {
  refilling_item_id: number;
  quantity: number;
}

export interface SaveFinalizePayload {
  type: 'room' | 'other';
  room_status?: string;
  items: FinalizeItem[];
  refilling_usages?: RefillingUsageItem[];
}

// ─── Room Status Types ─────────────────────────────────────────────────────────

export type RoomStatusType =
  | 'Occupied'
  | 'Need to Clean'
  | 'Dirty'
  | 'Clean'
  | 'Need to Touch Up';

export interface RoomStatusInfo {
  color: string;
  label: RoomStatusType | string;
  bg: string;
  border: string;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/**
 * 0) Get All Rooms
 * GET /api/checklist
 * Fetch all rooms with their latest checklist summary
 */
export const getRooms = async (): Promise<RoomsResponse> => {
  const response = await api.get('/checklist');
  return response.data;
};

/**
 * 1) Get Checklist Template (by Room ID)
 * GET /api/checklists/room/{room_id}/template
 */
export const getChecklistTemplate = async (
  roomId: number,
): Promise<ChecklistTemplate | null> => {
  try {
    const response = await api.get(`/checklists/room/${roomId}/template`);
    if (response.data?.success && response.data?.data) return response.data.data;
    return null;
  } catch (err: any) {
    if (err?.response?.status === 400 || err?.response?.status === 404) return null;
    throw err;
  }
};

/**
 * 2) Save Checklist
 * POST /api/checklists
 * Supports multipart/form-data for image upload
 */
export const saveChecklist = async (
  payload: SaveChecklistPayload,
): Promise<RoomChecklist> => {
  const formData = new FormData();
  formData.append('location_id', String(payload.location_id));
  formData.append('type', payload.type);

  payload.check_list_items.forEach((item, idx) => {
    formData.append(`check_list_items[${idx}][housekeeping_id]`, String(item.housekeeping_id));
    formData.append(`check_list_items[${idx}][status]`, item.status);
  });

  if (payload.images && payload.images.length > 0) {
    payload.images.forEach((img) => {
      formData.append('images[]', { uri: img.uri, name: img.name, type: img.type } as any);
    });
  }

  const response = await api.post('/checklists', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

/**
 * 3) Get Finalize Check List Template (by Room ID)
 * GET /api/checklists/room/{room_id}/finalize-template
 */
export const getFinalizeTemplate = async (
  roomId: number,
): Promise<FinalizeTemplate | null> => {
  try {
    const response = await api.get(`/checklists/room/${roomId}/finalize-template`);
    if (response.data?.success && response.data?.data) return response.data.data;
    return null;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

/**
 * 4) Save Finalize Check List
 * POST /api/checklists/{id}/finalize
 * Supervisor approval. Supports multipart for additional images.
 */
export const saveFinalize = async (
  checklistId: number,
  payload: SaveFinalizePayload,
  images?: { uri: string; name: string; type: string }[],
): Promise<RoomChecklist> => {
  const formData = new FormData();
  formData.append('type', payload.type);
  if (payload.room_status) formData.append('room_status', payload.room_status);

  payload.items.forEach((item, idx) => {
    formData.append(`items[${idx}][detail_id]`, String(item.detail_id));
    formData.append(`items[${idx}][supervisor_status]`, item.supervisor_status);
    if (item.reason) formData.append(`items[${idx}][reason]`, item.reason);
  });

  if (payload.refilling_usages && payload.refilling_usages.length > 0) {
    payload.refilling_usages.forEach((r, idx) => {
      formData.append(`refilling_usages[${idx}][refilling_item_id]`, String(r.refilling_item_id));
      formData.append(`refilling_usages[${idx}][quantity]`, String(r.quantity));
    });
  }

  if (images && images.length > 0) {
    images.forEach((img) => {
      formData.append('images[]', { uri: img.uri, name: img.name, type: img.type } as any);
    });
  }

  const response = await api.post(`/checklists/${checklistId}/finalize`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

/**
 * 5) Get Latest Checked Checklist (by Room ID)
 * GET /api/checklists/room/{room_id}/latest-checked
 */
export const getChecklistByRoom = async (
  roomId: number,
): Promise<RoomChecklist | null> => {
  try {
    const response = await api.get(`/checklists/room/${roomId}/latest-checked`);
    if (response.data?.success && response.data?.data) return response.data.data;
    return null;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

// ─── Utility Helpers ──────────────────────────────────────────────────────────

/**
 * Resolves full image URL
 */
export const resolveImageUrl = (img: ChecklistImage, baseUrl: string): string => {
  if (img.image_url && img.image_url.startsWith('http')) return img.image_url;
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}/images/checklist/${img.image}`;
};

/**
 * Determines room status based on business logic:
 * 1. Occupied – guest currently staying in the room.
 * 2. Need to Clean – guest stays 3+ days without cleaning.
 * 3. Dirty – guest checks out OR room marked 'Not Ready'.
 * 4. Clean – finalized within last 24h.
 * 5. Need to Touch Up – cleaned but >24h ago, no guest.
 */
export const getRoomStatusColor = (room: Room): RoomStatusInfo => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const booking = room.current_booking ?? null;

  // Case-insensitive status checks
  const isStatus = (s: string, list: string[]) =>
    list.includes(s.toLowerCase().replace(/[-_ ]/g, ''));

  // 1. Is Occupied? (Guest currently checked IN)
  const isOccupied = booking && isStatus(booking.status, ['checkedin', 'checkin', 'active', 'inhouse']) &&
    booking.start_date <= todayStr && booking.end_date >= todayStr;

  // Is Checked Out?
  const guestCheckedOut = booking && isStatus(booking.status, ['checkedout', 'checkout', 'departed']);

  const lastCheckedAt = room.check_list?.updated_at ?? null;
  const lastCheckedDate = lastCheckedAt ? new Date(lastCheckedAt) : null;
  const hoursSinceClean = lastCheckedDate ? (now.getTime() - lastCheckedDate.getTime()) / 3600000 : Infinity;

  // 4. Clean — finalized within last 24h
  const isRecentlyCleaned = room.check_list?.status === 'Checked' && hoursSinceClean <= 24;

  // Priority 1 & 2: Occupied / Need to Clean
  if (isOccupied) {
    // 2. Need to Clean — guest stayed 3+ days and no clean in last 72h
    if (hoursSinceClean > 72) {
      const checkInDate = new Date(booking!.start_date);
      const daysStayed = (now.getTime() - checkInDate.getTime()) / 86400000;
      if (daysStayed >= 3) {
        return { color: '#D97706', label: 'Need to Clean', bg: '#FEF3C7', border: '#FCD34D' };
      }
    }
    return { color: '#3B82F6', label: 'Occupied', bg: '#DBEAFE', border: '#93C5FD' };
  }

  // 3. Dirty — guest checked out OR specifically marked as Not Ready (if not recently cleaned)
  if (guestCheckedOut || (room.check_list?.room_status === 'Not Ready' && !isRecentlyCleaned)) {
    // If it was cleaned AFTER checkout, it shouldn't be dirty unless marked Not Ready
    const checkoutDate = booking ? new Date(booking.end_date) : null;
    const cleanedAfterCheckout = lastCheckedDate && checkoutDate && lastCheckedDate > checkoutDate;

    if (!cleanedAfterCheckout || room.check_list?.room_status === 'Not Ready') {
      return { color: '#EF4444', label: 'Dirty', bg: '#FEE2E2', border: '#FCA5A5' };
    }
  }

  // 4. Clean
  if (isRecentlyCleaned) {
    return { color: '#10B981', label: 'Clean', bg: '#D1FAE5', border: '#6EE7B7' };
  }

  // 5. Need to Touch Up — cleaned but >24h ago, no current guest
  if (room.check_list?.status === 'Checked' && hoursSinceClean > 24) {
    return { color: '#F59E0B', label: 'Need to Touch Up', bg: '#FEF3C7', border: '#FDE68A' };
  }

  // Fallback: If not Occupied, Clean, or Touch Up, it's Dirty (includes repairs)
  return { color: '#EF4444', label: 'Dirty', bg: '#FEE2E2', border: '#FCA5A5' };
};

/**
 * Calculates time ago for display
 */
export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.abs(now.getTime() - date.getTime());
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};