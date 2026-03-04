
// // services/housekeepingService.ts
// import api from '../config/apiConfig';

// // ─── Interfaces ────────────────────────────────────────────────────────────────

// export interface RoomCategory {
//   id: number;
//   category: string;
//   custome_name: string;
//   room_type: string;
//   status: string;
//   price: number;
//   num_of_bed: number;
//   max_adults_limit: number;
//   max_children_limit: number;
//   image: string | null;
// }

// export interface Housekeeper {
//   id: number;
//   name: string;
//   lname: string;
//   email: string;
//   role: string;
//   status: string;
// }

// export interface CheckList {
//   id: number;
//   room_id: number;
//   status: string;
//   room_status: string;
//   housekeeper_id: number;
//   supervisor_id: number | null;
//   image: string | null;
//   created_at: string;
//   updated_at: string;
//   housekeeper: Housekeeper | null;
//   supervisor: Housekeeper | null;
// }

// export interface Room {
//   id: number;
//   room_number: string;
//   room_type: string;
//   hotel_id: number;
//   reapair: string | null;
//   is_visible: number;
//   created_at: string;
//   updated_at: string;
//   room_category: RoomCategory;
//   check_list: CheckList | null;
// }

// export interface RoomsResponse {
//   status: boolean;
//   message: string;
//   rooms: Room[];
// }

// // ─── Checklist Detail Interfaces ──────────────────────────────────────────────

// export interface ChecklistDetailItem {
//   id: number;
//   housekeeping_id: number;
//   housekeeper_status: string | null;
//   supervisor_status: string | null;
//   reason: string | null;
//   housekeeping: {
//     id: number;
//     item_name: string;
//     status: string | null;
//   };
// }

// export interface ChecklistImage {
//   id: number;
//   image: string;
//   image_url: string;
// }

// export interface RoomChecklist {
//   id: number;
//   room_id: string;
//   status: string;
//   room_status: string;
//   housekeeper_id: string;
//   supervisor_id: string | null;
//   created_at: string;
//   updated_at: string;
//   housekeeper: Housekeeper | null;
//   supervisor: Housekeeper | null;
//   room: {
//     id: number;
//     room_number: string;
//     room_type: string;
//   };
//   check_list_detail: ChecklistDetailItem[];
//   check_list_image: ChecklistImage[];
// }

// // ─── Template Interfaces (for New Checklist) ──────────────────────────────────

// export interface TemplateHousekeepingItem {
//   id: number;
//   item_name: string;
//   check_list_layout_id: number;
//   status: string | null;
// }

// export interface ChecklistTemplate {
//   room: {
//     id: number;
//     room_number: string;
//     check_list_layout_id: number;
//   };
//   housekeeping_items: TemplateHousekeepingItem[];
// }

// // ─── Finalize Template Interfaces ─────────────────────────────────────────────
// // Matches real API response: refilling_items[].item.item (item name)

// export interface RefillingItemDetail {
//   id: number;
//   unit: string;
//   item: string;          // item name e.g. "Water (500ml)"
//   quantity: string;
//   unit_price: number;
//   hotel_id: string;
// }

// export interface RefillingItem {
//   id: number;
//   check_list_layout_id: string;
//   item_id: string;
//   status: string | null;
//   item: RefillingItemDetail;
// }

// export interface JanitorialItemDetail {
//   id: number;
//   unit: string;
//   item: string;
//   quantity: string;
//   unit_price: number;
//   hotel_id: string;
// }

// export interface JanitorialItem {
//   id: number;
//   check_list_layout_id: string;
//   item_id: string;
//   status: string | null;
//   item: JanitorialItemDetail;
// }

// export interface FinalizeTemplate {
//   room: {
//     id: number;
//     room_number: string;
//   };
//   checklist: RoomChecklist;
//   janitorial_items: JanitorialItem[];
//   refilling_items: RefillingItem[];
// }

// // ─── Finalize Save Interfaces ──────────────────────────────────────────────────

// export interface FinalizeItem {
//   detail_id: number;
//   supervisor_status: 'Yes' | 'No';
//   reason?: string;
// }

// export interface RefillingUsageItem {
//   refilling_item_id: number;   // RefillingItem.id
//   quantity: number;
// }

// export interface SaveFinalizePayload {
//   type: 'room' | 'other';
//   room_status?: 'Ready' | 'Not Ready';
//   items: FinalizeItem[];
//   refilling_usages?: RefillingUsageItem[];
// }

// // ─── API Calls ─────────────────────────────────────────────────────────────────

// /**
//  * GET /api/checklist
//  * Fetch all rooms with their latest checklist summary
//  */
// export const getRooms = async (): Promise<RoomsResponse> => {
//   const response = await api.get('/checklist');
//   return response.data;
// };

// /**
//  * GET /api/checklists/room/{room_id}/latest-checked
//  * Returns null on 404
//  */
// export const getChecklistByRoom = async (
//   roomId: number,
// ): Promise<RoomChecklist | null> => {
//   try {
//     const response = await api.get(`/checklists/room/${roomId}/latest-checked`);
//     if (response.data?.success && response.data?.data) return response.data.data;
//     return null;
//   } catch (err: any) {
//     if (err?.response?.status === 404) return null;
//     throw err;
//   }
// };

// /**
//  * GET /api/checklists/room/{room_id}/template
//  * Returns null on 400/404
//  */
// export const getChecklistTemplate = async (
//   roomId: number,
// ): Promise<ChecklistTemplate | null> => {
//   try {
//     const response = await api.get(`/checklists/room/${roomId}/template`);
//     if (response.data?.success && response.data?.data) return response.data.data;
//     return null;
//   } catch (err: any) {
//     if (err?.response?.status === 400 || err?.response?.status === 404) return null;
//     throw err;
//   }
// };

// /**
//  * POST /api/checklists
//  * Supports optional image upload via multipart/form-data
//  */
// export interface SaveChecklistPayload {
//   location_id: number;
//   type: 'room' | 'other';
//   check_list_items: { housekeeping_id: number; status: 'Yes' | 'No' }[];
//   images?: { uri: string; name: string; type: string }[];
// }

// export const saveChecklist = async (
//   payload: SaveChecklistPayload,
// ): Promise<RoomChecklist> => {
//   if (payload.images && payload.images.length > 0) {
//     const formData = new FormData();
//     formData.append('location_id', String(payload.location_id));
//     formData.append('type', payload.type);
//     payload.check_list_items.forEach((item, idx) => {
//       formData.append(`check_list_items[${idx}][housekeeping_id]`, String(item.housekeeping_id));
//       formData.append(`check_list_items[${idx}][status]`, item.status);
//     });
//     payload.images.forEach((img) => {
//       formData.append('images[]', { uri: img.uri, name: img.name, type: img.type } as any);
//     });
//     const response = await api.post('/checklists', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response.data.data;
//   }
//   const response = await api.post('/checklists', {
//     location_id: payload.location_id,
//     type: payload.type,
//     check_list_items: payload.check_list_items,
//   });
//   return response.data.data;
// };

// /**
//  * GET /api/checklists/room/{room_id}/finalize-template
//  * Returns null on 404
//  */
// export const getFinalizeTemplate = async (
//   roomId: number,
// ): Promise<FinalizeTemplate | null> => {
//   try {
//     const response = await api.get(`/checklists/room/${roomId}/finalize-template`);
//     if (response.data?.success && response.data?.data) return response.data.data;
//     return null;
//   } catch (err: any) {
//     if (err?.response?.status === 404) return null;
//     throw err;
//   }
// };

// /**
//  * POST /api/checklists/{id}/finalize
//  * Supports optional image upload via multipart/form-data
//  */
// export const saveFinalize = async (
//   checklistId: number,
//   payload: SaveFinalizePayload,
//   images?: { uri: string; name: string; type: string }[],
// ): Promise<RoomChecklist> => {
//   if (images && images.length > 0) {
//     const formData = new FormData();
//     formData.append('type', payload.type);
//     if (payload.room_status) formData.append('room_status', payload.room_status);
//     payload.items.forEach((item, idx) => {
//       formData.append(`items[${idx}][detail_id]`, String(item.detail_id));
//       formData.append(`items[${idx}][supervisor_status]`, item.supervisor_status);
//       if (item.reason) formData.append(`items[${idx}][reason]`, item.reason);
//     });
//     payload.refilling_usages?.forEach((r, idx) => {
//       formData.append(`refilling_usages[${idx}][refilling_item_id]`, String(r.refilling_item_id));
//       formData.append(`refilling_usages[${idx}][quantity]`, String(r.quantity));
//     });
//     images.forEach((img) => {
//       formData.append('images[]', { uri: img.uri, name: img.name, type: img.type } as any);
//     });
//     const response = await api.post(`/checklists/${checklistId}/finalize`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response.data.data;
//   }
//   const response = await api.post(`/checklists/${checklistId}/finalize`, payload);
//   return response.data.data;
// };

// // ─── Utility Helpers ───────────────────────────────────────────────────────────

// export const getRoomStatusColor = (room: Room) => {
//   if (room.reapair === 'repair') {
//     return { color: '#EF4444', label: 'Under Repair', bg: '#FEE2E2', border: '#FCA5A5' };
//   }
//   const roomStatus  = room.check_list?.room_status;
//   const checkStatus = room.check_list?.status;

//   if (!roomStatus) {
//     return { color: '#9CA3AF', label: 'No Status', bg: '#F3F4F6', border: '#E5E7EB' };
//   }
//   if (roomStatus === 'Ready' && checkStatus === 'Checked') {
//     return { color: '#10B981', label: 'Ready', bg: '#D1FAE5', border: '#6EE7B7' };
//   }
//   if (checkStatus === 'Pending') {
//     return { color: '#F59E0B', label: 'Pending Review', bg: '#FEF3C7', border: '#FCD34D' };
//   }
//   if (roomStatus === 'Not Ready') {
//     return { color: '#EF4444', label: 'Dirty', bg: '#FEE2E2', border: '#FCA5A5' };
//   }
//   return { color: '#F59E0B', label: 'Need to clean up', bg: '#FEF3C7', border: '#FCD34D' };
// };

// export const getTimeAgo = (dateString: string): string => {
//   const date   = new Date(dateString);
//   const now    = new Date();
//   const diff   = Math.abs(now.getTime() - date.getTime());
//   const mins   = Math.floor(diff / 60000);
//   const hours  = Math.floor(diff / 3600000);
//   const days   = Math.floor(diff / 86400000);
//   const months = Math.floor(days / 30);

//   if (mins  < 60) return `${mins}m ago`;
//   if (hours < 24) return `${hours}h ago`;
//   if (days  < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
//   return `${months} month${months !== 1 ? 's' : ''} ago`;
// };



// services/housekeepingService.ts
import api from '../config/apiConfig';

// ─── Interfaces ────────────────────────────────────────────────────────────────

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
  lname: string;
  email: string;
  role: string;
  status: string;
}

export interface CheckList {
  id: number;
  room_id: number;
  status: string;
  room_status: string;
  housekeeper_id: number;
  supervisor_id: number | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  housekeeper: Housekeeper | null;
  supervisor: Housekeeper | null;
}

export interface Room {
  id: number;
  room_number: string;
  room_type: string;
  hotel_id: number;
  reapair: string | null;
  is_visible: number;
  created_at: string;
  updated_at: string;
  room_category: RoomCategory;
  check_list: CheckList | null;
  // Booking info injected from calendar API
  current_booking?: {
    booking_id: number;
    guest_name: string;
    start_date: string;
    end_date: string;
    status: string;
  } | null;
}

export interface RoomsResponse {
  status: boolean;
  message: string;
  rooms: Room[];
}

// ─── Checklist Detail Interfaces ──────────────────────────────────────────────

export interface ChecklistDetailItem {
  id: number;
  housekeeping_id: number;
  housekeeper_status: string | null;
  supervisor_status: string | null;
  reason: string | null;
  housekeeping: {
    id: number;
    item_name: string;
    status: string | null;
  };
}

export interface ChecklistImage {
  id: number;
  image: string;
  image_url: string;
}

export interface RoomChecklist {
  id: number;
  room_id: string;
  status: string;
  room_status: string;
  housekeeper_id: string;
  supervisor_id: string | null;
  created_at: string;
  updated_at: string;
  housekeeper: Housekeeper | null;
  supervisor: Housekeeper | null;
  room: {
    id: number;
    room_number: string;
    room_type: string;
  };
  check_list_detail: ChecklistDetailItem[];
  check_list_image: ChecklistImage[];
}

// ─── Template Interfaces (for New Checklist) ──────────────────────────────────

export interface TemplateHousekeepingItem {
  id: number;
  item_name: string;
  check_list_layout_id: number;
  status: string | null;
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

// ─── Finalize Save Interfaces ──────────────────────────────────────────────────

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
  room_status?: 'Ready' | 'Not Ready';
  items: FinalizeItem[];
  refilling_usages?: RefillingUsageItem[];
}

// ─── Room Status Types ─────────────────────────────────────────────────────────

export type RoomStatusType =
  | 'Occupied'
  | 'Need to Clean'
  | 'Dirty'
  | 'Clean'
  | 'Need to Touch Up'
  | 'No Status';

export interface RoomStatusInfo {
  color: string;
  label: RoomStatusType | string;
  bg: string;
  border: string;
}

// ─── API Calls ─────────────────────────────────────────────────────────────────

/**
 * GET /api/checklist
 * Fetch all rooms with their latest checklist summary
 */
export const getRooms = async (): Promise<RoomsResponse> => {
  const response = await api.get('/checklist');
  return response.data;
};

/**
 * GET /api/checklists/room/{room_id}/latest-checked
 * Returns null on 404
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

/**
 * GET /api/checklists/room/{room_id}/template
 * Returns null on 400/404
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
 * POST /api/checklists
 * Supports optional image upload via multipart/form-data
 */
export interface SaveChecklistPayload {
  location_id: number;
  type: 'room' | 'other';
  check_list_items: { housekeeping_id: number; status: 'Yes' | 'No' }[];
  images?: { uri: string; name: string; type: string }[];
}

export const saveChecklist = async (
  payload: SaveChecklistPayload,
): Promise<RoomChecklist> => {
  if (payload.images && payload.images.length > 0) {
    const formData = new FormData();
    formData.append('location_id', String(payload.location_id));
    formData.append('type', payload.type);
    payload.check_list_items.forEach((item, idx) => {
      formData.append(`check_list_items[${idx}][housekeeping_id]`, String(item.housekeeping_id));
      formData.append(`check_list_items[${idx}][status]`, item.status);
    });
    payload.images.forEach((img) => {
      formData.append('images[]', { uri: img.uri, name: img.name, type: img.type } as any);
    });
    const response = await api.post('/checklists', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }
  const response = await api.post('/checklists', {
    location_id: payload.location_id,
    type: payload.type,
    check_list_items: payload.check_list_items,
  });
  return response.data.data;
};

/**
 * GET /api/checklists/room/{room_id}/finalize-template
 * Returns null on 404
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
 * POST /api/checklists/{id}/finalize
 * Supports optional image upload via multipart/form-data
 */
export const saveFinalize = async (
  checklistId: number,
  payload: SaveFinalizePayload,
  images?: { uri: string; name: string; type: string }[],
): Promise<RoomChecklist> => {
  if (images && images.length > 0) {
    const formData = new FormData();
    formData.append('type', payload.type);
    if (payload.room_status) formData.append('room_status', payload.room_status);
    payload.items.forEach((item, idx) => {
      formData.append(`items[${idx}][detail_id]`, String(item.detail_id));
      formData.append(`items[${idx}][supervisor_status]`, item.supervisor_status);
      if (item.reason) formData.append(`items[${idx}][reason]`, item.reason);
    });
    payload.refilling_usages?.forEach((r, idx) => {
      formData.append(`refilling_usages[${idx}][refilling_item_id]`, String(r.refilling_item_id));
      formData.append(`refilling_usages[${idx}][quantity]`, String(r.quantity));
    });
    images.forEach((img) => {
      formData.append('images[]', { uri: img.uri, name: img.name, type: img.type } as any);
    });
    const response = await api.post(`/checklists/${checklistId}/finalize`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }
  const response = await api.post(`/checklists/${checklistId}/finalize`, payload);
  return response.data.data;
};

// ─── Image URL Helper ──────────────────────────────────────────────────────────
export const resolveImageUrl = (img: ChecklistImage, baseUrl: string): string => {
  if (img.image_url && img.image_url.startsWith('http')) return img.image_url;
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}/checklist_image/thumbnai/${img.image}`;
};

// ─── Room Status Logic ─────────────────────────────────────────────────────────

/** Helper: case-insensitive status check */
const isCheckedIn = (status: string): boolean => {
  const s = status.toLowerCase().replace(/[-_ ]/g, '');
  // matches: checkedin, checkin, check_in, checked_in, active, inhouse
  return ['checkedin', 'checkin', 'active', 'inhouse'].includes(s);
};

const isCheckedOut = (status: string): boolean => {
  const s = status.toLowerCase().replace(/[-_ ]/g, '');
  // matches: checkedout, checkout, check_out, checked_out, departed
  return ['checkedout', 'checkout', 'departed'].includes(s);
};

/**
 * Determines room status — exactly 5 statuses:
 *
 * 1. Occupied      – guest currently checked in (from calendar)
 * 2. Need to Clean – guest stayed 3+ days without cleaning
 * 3. Dirty         – guest checked out & room not yet cleaned
 * 4. Clean         – checklist finalized (Checked) within last 24h
 * 5. Need to Touch Up – cleaned but >24h ago with no current guest
 *
 * Fallback: No Status
 */
export const getRoomStatusColor = (room: Room): RoomStatusInfo => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const booking = room.current_booking ?? null;

  // Is a guest currently checked IN?
  const isOccupied =
    booking !== null &&
    isCheckedIn(booking.status) &&
    booking.start_date <= todayStr &&
    booking.end_date >= todayStr;

  // Did the guest check OUT?
  const guestCheckedOut =
    booking !== null && isCheckedOut(booking.status);

  // Last cleaned info
  const lastCheckedAt = room.check_list?.updated_at ?? null;
  const lastCheckedDate = lastCheckedAt ? new Date(lastCheckedAt) : null;
  const hoursSinceClean = lastCheckedDate
    ? (now.getTime() - lastCheckedDate.getTime()) / 3600000
    : Infinity;
  const isRecentlyCleaned =
    room.check_list?.status === 'Checked' && hoursSinceClean <= 24;

  // 1 & 2. Occupied / Need to Clean
  if (isOccupied) {
    // Need to Clean — guest stayed 3+ days and no clean in last 72h
    if (hoursSinceClean > 72) {
      const checkInDate = new Date(booking!.start_date);
      const daysStayed = (now.getTime() - checkInDate.getTime()) / 86400000;
      if (daysStayed >= 3) {
        return {
          color: '#D97706',
          label: 'Need to Clean',
          bg: '#FEF3C7',
          border: '#FCD34D',
        };
      }
    }
    return {
      color: '#3B82F6',
      label: 'Occupied',
      bg: '#DBEAFE',
      border: '#93C5FD',
    };
  }

  // 3. Dirty — guest checked out and room not cleaned after checkout
  if (guestCheckedOut) {
    const checkoutDate = new Date(booking!.end_date);
    const cleanedAfterCheckout =
      room.check_list?.status === 'Checked' &&
      lastCheckedDate !== null &&
      lastCheckedDate > checkoutDate;

    if (!cleanedAfterCheckout) {
      return {
        color: '#EF4444',
        label: 'Dirty',
        bg: '#FEE2E2',
        border: '#FCA5A5',
      };
    }
  }

  // Also Dirty if supervisor marked room as Not Ready and not recently cleaned
  if (room.check_list?.room_status === 'Not Ready' && !isRecentlyCleaned) {
    return {
      color: '#EF4444',
      label: 'Dirty',
      bg: '#FEE2E2',
      border: '#FCA5A5',
    };
  }

  // 4. Clean — finalized within last 24h
  if (isRecentlyCleaned) {
    return {
      color: '#10B981',
      label: 'Clean',
      bg: '#D1FAE5',
      border: '#6EE7B7',
    };
  }

  // 5. Need to Touch Up — cleaned but >24h ago, no current guest
  if (room.check_list?.status === 'Checked' && hoursSinceClean > 24) {
    return {
      color: '#8B5CF6',
      label: 'Need to Touch Up',
      bg: '#EDE9FE',
      border: '#C4B5FD',
    };
  }

  // No Status — fallback
  return {
    color: '#9CA3AF',
    label: 'No Status',
    bg: '#F3F4F6',
    border: '#E5E7EB',
  };
};

// ─── Utility Helpers ───────────────────────────────────────────────────────────

export const getTimeAgo = (dateString: string): string => {
  const date   = new Date(dateString);
  const now    = new Date();
  const diff   = Math.abs(now.getTime() - date.getTime());
  const mins   = Math.floor(diff / 60000);
  const hours  = Math.floor(diff / 3600000);
  const days   = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);

  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return `${months} month${months !== 1 ? 's' : ''} ago`;
};