// // services/lostFound.ts
// import api, { BASE_URL } from "../config/apiConfig";

// /* =======================
//    TYPES
// ======================= */

// export type LostItem = {
//   id: number;
//   hotel_id: string;
//   guest_name: string;
//   telephone: string;
//   email: string;
//   item_name: string;
//   location: string;
//   lost_date: string;
//   lost_time: string | null;
//   file_path: string | null;
//   additional_note: string | null;
//   status: "Pending" | "Returned" | "Unclaimed";
//   created_at: string;
//   updated_at: string;
//   item_type: string | null;
// };

// export type FoundItem = {
//   id: number;
//   hotel_id: string;
//   finder_name: string;
//   telephone: string;
//   email: string;
//   item_name: string;
//   location: string;
//   found_date: string;
//   found_time: string | null;
//   file_path: string | null;
//   additional_notes: string | null;
//   status: "Pending" | "Returned" | "Unclaimed";
//   created_at: string;
//   updated_at: string;
// };

// export type LostItemsResponse  = { item: LostItem[] };
// export type FoundItemsResponse = { item: FoundItem[] };

// export type StoreLostPayload = {
//   guest_name: string;
//   telephone: string;
//   email?: string;
//   item_name: string;
//   location: string;
//   lost_date: string;
//   lost_time?: string;
//   additional_notes?: string;
//   status: string;
//   file_upload?: { uri: string; name: string; type: string }[];
// };

// export type StoreFoundPayload = {
//   finder_name: string;
//   telephone: string;
//   email?: string;
//   item_name: string;
//   location: string;
//   found_date: string;
//   found_time?: string;
//   additional_notes?: string;
//   status: string;
//   file_upload?: { uri: string; name: string; type: string }[];
// };

// /* =======================
//    HELPERS
// ======================= */

// /** Parse JSON-stringified file_path → first image URL or null */
// export const parseImageUrl = (filePath: string | null): string | null => {
//   if (!filePath) return null;
//   try {
//     const paths = JSON.parse(filePath) as string[];
//     if (!paths.length) return null;
//     // Normalize backslashes and build full URL
//     const clean = paths[0].replace(/\\\//g, "/");
//     return `${BASE_URL.replace("/api", "")}/storage/${clean}`;
//   } catch {
//     return null;
//   }
// };

// /* =======================
//    SERVICE
// ======================= */

// const lostFoundService = {
//   /* ── GET Lost Items ─────────────────────────────────────────────── */
//   getLostItems: async (): Promise<LostItemsResponse> => {
//     const { data } = await api.post("/lost_found/lostview");
//     return data;
//   },

//   /* ── GET Found Items ────────────────────────────────────────────── */
//   getFoundItems: async (): Promise<FoundItemsResponse> => {
//     const { data } = await api.post("/lost_found/foundview");
//     return data;
//   },

//   /* ── Store Lost Item (multipart/form-data) ──────────────────────── */
//   storeLostItem: async (payload: StoreLostPayload): Promise<any> => {
//     const formData = new FormData();

//     formData.append("guest_name",   payload.guest_name);
//     formData.append("telephone",    payload.telephone);
//     if (payload.email)            formData.append("email",            payload.email);
//     formData.append("item_name",    payload.item_name);
//     formData.append("location",     payload.location);
//     formData.append("lost_date",    payload.lost_date);
//     if (payload.lost_time)        formData.append("lost_time",        payload.lost_time);
//     if (payload.additional_notes) formData.append("additional_notes", payload.additional_notes);
//     formData.append("status",       payload.status);

//     if (payload.file_upload?.length) {
//       payload.file_upload.forEach((f) => {
//         formData.append("file_upload[]", {
//           uri:  f.uri,
//           name: f.name,
//           type: f.type,
//         } as any);
//       });
//     }

//     const { data } = await api.post("/lost_found/storeLost", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   },

//   /* ── Store Found Item (multipart/form-data) ─────────────────────── */
//   storeFoundItem: async (payload: StoreFoundPayload): Promise<any> => {
//     const formData = new FormData();

//     formData.append("finder_name",  payload.finder_name);
//     formData.append("telephone",    payload.telephone);
//     if (payload.email)            formData.append("email",            payload.email);
//     formData.append("item_name",    payload.item_name);
//     formData.append("location",     payload.location);
//     formData.append("found_date",   payload.found_date);
//     if (payload.found_time)       formData.append("found_time",       payload.found_time);
//     if (payload.additional_notes) formData.append("additional_notes", payload.additional_notes);
//     formData.append("status",       payload.status);

//     if (payload.file_upload?.length) {
//       payload.file_upload.forEach((f) => {
//         formData.append("file_upload[]", {
//           uri:  f.uri,
//           name: f.name,
//           type: f.type,
//         } as any);
//       });
//     }

//     const { data } = await api.post("/lost_found/foundStore", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   },
// };

// export default lostFoundService;



// // services/lostFound.ts
// import api, { BASE_URL } from "../config/apiConfig";

// /* =======================
//    TYPES
// ======================= */

// export type LostItem = {
//   id: number;
//   hotel_id: string;
//   guest_name: string;
//   telephone: string;
//   email: string;
//   item_name: string;
//   location: string;
//   lost_date: string;
//   lost_time: string | null;
//   file_path: string | null;
//   additional_note: string | null;
//   status: "Pending" | "Returned" | "Unclaimed";
//   created_at: string;
//   updated_at: string;
//   item_type: string | null;
// };

// export type FoundItem = {
//   id: number;
//   hotel_id: string;
//   finder_name: string;
//   telephone: string;
//   email: string;
//   item_name: string;
//   location: string;
//   found_date: string;
//   found_time: string | null;
//   file_path: string | null;
//   additional_notes: string | null;
//   status: "Pending" | "Returned" | "Unclaimed";
//   created_at: string;
//   updated_at: string;
// };

// export type LostItemsResponse = { item: LostItem[] };
// export type FoundItemsResponse = { item: FoundItem[] };
// export type SingleLostItemResponse = { item: LostItem };
// export type SingleFoundItemResponse = { item: FoundItem };

// export type StoreLostPayload = {
//   guest_name: string;
//   telephone: string;
//   email?: string;
//   item_name: string;
//   location: string;
//   lost_date: string;
//   lost_time?: string;
//   additional_notes?: string;
//   status: string;
//   file_upload?: { uri: string; name: string; type: string }[];
// };

// export type StoreFoundPayload = {
//   finder_name: string;
//   telephone: string;
//   email?: string;
//   item_name: string;
//   location: string;
//   found_date: string;
//   found_time?: string;
//   additional_notes?: string;
//   status: string;
//   file_upload?: { uri: string; name: string; type: string }[];
// };

// export type UpdateLostPayload = {
//   id: number;
//   guest_name?: string;
//   telephone?: string;
//   email?: string;
//   item_name?: string;
//   location?: string;
//   lost_date?: string;
//   lost_time?: string;
//   additional_notes?: string;
//   status?: string;
//   file_upload?: { uri: string; name: string; type: string }[];
// };

// export type UpdateFoundPayload = {
//   id: number;
//   finder_name?: string;
//   telephone?: string;
//   email?: string;
//   item_name?: string;
//   location?: string;
//   found_date?: string;
//   found_time?: string;
//   additional_notes?: string;
//   status?: string;
//   file_upload?: { uri: string; name: string; type: string }[];
// };

// /* =======================
//    HELPERS
// ======================= */

// /** Parse JSON-stringified file_path → first image URL or null */
// export const parseImageUrl = (filePath: string | null): string | null => {
//   if (!filePath) return null;
//   try {
//     const paths = JSON.parse(filePath) as string[];
//     if (!paths.length) return null;
//     // Normalize backslashes and build full URL
//     const clean = paths[0].replace(/\\\//g, "/");
//     return `${BASE_URL.replace("/api", "")}/storage/${clean}`;
//   } catch {
//     return null;
//   }
// };

// /* =======================
//    SERVICE
// ======================= */

// const lostFoundService = {
//   /* ── GET Lost Items ─────────────────────────────────────────────── */
//   getLostItems: async (): Promise<LostItemsResponse> => {
//     const { data } = await api.post("/lost_found/lostview");
//     return data;
//   },

//   /* ── GET Found Items ────────────────────────────────────────────── */
//   getFoundItems: async (): Promise<FoundItemsResponse> => {
//     const { data } = await api.post("/lost_found/foundview");
//     return data;
//   },

//   /* ── GET Single Lost Item ───────────────────────────────────────── */
//   getLostItemById: async (id: number): Promise<SingleLostItemResponse> => {
//     const { data } = await api.get(`/lost_found/lost_get_item?id=${id}`);
//     return data;
//   },

//   /* ── GET Single Found Item ──────────────────────────────────────── */
//   getFoundItemById: async (id: number): Promise<SingleFoundItemResponse> => {
//     const { data } = await api.get(`/lost_found/edit_found?id=${id}`);
//     return data;
//   },

//   /* ── Store Lost Item (multipart/form-data) ──────────────────────── */
//   storeLostItem: async (payload: StoreLostPayload): Promise<any> => {
//     const formData = new FormData();

//     formData.append("guest_name", payload.guest_name);
//     formData.append("telephone", payload.telephone);
//     if (payload.email) formData.append("email", payload.email);
//     formData.append("item_name", payload.item_name);
//     formData.append("location", payload.location);
//     formData.append("lost_date", payload.lost_date);
//     if (payload.lost_time) formData.append("lost_time", payload.lost_time);
//     if (payload.additional_notes) formData.append("additional_notes", payload.additional_notes);
//     formData.append("status", payload.status);

//     if (payload.file_upload?.length) {
//       payload.file_upload.forEach((f) => {
//         formData.append("file_upload[]", {
//           uri: f.uri,
//           name: f.name,
//           type: f.type,
//         } as any);
//       });
//     }

//     const { data } = await api.post("/lost_found/storeLost", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   },

//   /* ── Store Found Item (multipart/form-data) ─────────────────────── */
//   storeFoundItem: async (payload: StoreFoundPayload): Promise<any> => {
//     const formData = new FormData();

//     formData.append("finder_name", payload.finder_name);
//     formData.append("telephone", payload.telephone);
//     if (payload.email) formData.append("email", payload.email);
//     formData.append("item_name", payload.item_name);
//     formData.append("location", payload.location);
//     formData.append("found_date", payload.found_date);
//     if (payload.found_time) formData.append("found_time", payload.found_time);
//     if (payload.additional_notes) formData.append("additional_notes", payload.additional_notes);
//     formData.append("status", payload.status);

//     if (payload.file_upload?.length) {
//       payload.file_upload.forEach((f) => {
//         formData.append("file_upload[]", {
//           uri: f.uri,
//           name: f.name,
//           type: f.type,
//         } as any);
//       });
//     }

//     const { data } = await api.post("/lost_found/foundStore", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   },

//   /* ── Update Lost Item ───────────────────────────────────────────── */
//   updateLostItem: async (payload: UpdateLostPayload): Promise<any> => {
//     const formData = new FormData();
    
//     formData.append("id", payload.id.toString());
//     if (payload.guest_name) formData.append("guest_name", payload.guest_name);
//     if (payload.telephone) formData.append("telephone", payload.telephone);
//     if (payload.email) formData.append("email", payload.email);
//     if (payload.item_name) formData.append("item_name", payload.item_name);
//     if (payload.location) formData.append("location", payload.location);
//     if (payload.lost_date) formData.append("lost_date", payload.lost_date);
//     if (payload.lost_time) formData.append("lost_time", payload.lost_time);
//     if (payload.additional_notes) formData.append("additional_notes", payload.additional_notes);
//     if (payload.status) formData.append("status", payload.status);

//     if (payload.file_upload?.length) {
//       payload.file_upload.forEach((f) => {
//         formData.append("file_upload[]", {
//           uri: f.uri,
//           name: f.name,
//           type: f.type,
//         } as any);
//       });
//     }

//     const { data } = await api.post("/lost_found/lost_item_update", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   },

//   /* ── Update Found Item ──────────────────────────────────────────── */
//   updateFoundItem: async (payload: UpdateFoundPayload): Promise<any> => {
//     const formData = new FormData();
    
//     formData.append("id", payload.id.toString());
//     if (payload.finder_name) formData.append("finder_name", payload.finder_name);
//     if (payload.telephone) formData.append("telephone", payload.telephone);
//     if (payload.email) formData.append("email", payload.email);
//     if (payload.item_name) formData.append("item_name", payload.item_name);
//     if (payload.location) formData.append("location", payload.location);
//     if (payload.found_date) formData.append("found_date", payload.found_date);
//     if (payload.found_time) formData.append("found_time", payload.found_time);
//     if (payload.additional_notes) formData.append("additional_notes", payload.additional_notes);
//     if (payload.status) formData.append("status", payload.status);

//     if (payload.file_upload?.length) {
//       payload.file_upload.forEach((f) => {
//         formData.append("file_upload[]", {
//           uri: f.uri,
//           name: f.name,
//           type: f.type,
//         } as any);
//       });
//     }

//     const { data } = await api.post("/lost_found/edit_found_save", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   },

//   /* ── Delete Lost Item ───────────────────────────────────────────── */
//   deleteLostItem: async (id: number): Promise<any> => {
//     const { data } = await api.post("/lost_found/lost_destroy", { id });
//     return data;
//   },

//   /* ── Delete Found Item ──────────────────────────────────────────── */
//   deleteFoundItem: async (id: number): Promise<any> => {
//     const { data } = await api.post("/lost_found/found_destroy", { id });
//     return data;
//   },

//   /* ── Update Found Item Status ───────────────────────────────────── */
//   updateFoundItemStatus: async (id: number, status: string): Promise<any> => {
//     const { data } = await api.post("/lost_found/found_update_status", { id, status });
//     return data;
//   },
// };

// export default lostFoundService;











// services/lost_&_found.ts
import api, { BASE_URL } from "../config/apiConfig";

/* =======================
   TYPES
======================= */

export type LostItem = {
  id: number;
  hotel_id: string;
  guest_name: string;
  telephone: string;
  email: string;
  item_name: string;
  location: string;
  lost_date: string;
  lost_time: string | null;
  file_path: string | null;
  additional_note: string | null;
  status: "Pending" | "Returned" | "Unclaimed";
  created_at: string;
  updated_at: string;
  item_type: string | null;
};

export type FoundItem = {
  id: number;
  hotel_id: string;
  finder_name: string;
  telephone: string;
  email: string;
  item_name: string;
  location: string;
  found_date: string;
  found_time: string | null;
  file_path: string | null;
  additional_notes: string | null;
  status: "Pending" | "Returned" | "Unclaimed";
  created_at: string;
  updated_at: string;
};

export type LostItemsResponse = { item: LostItem[] };
export type FoundItemsResponse = { item: FoundItem[] };
export type SingleLostItemResponse = { item: LostItem };
export type SingleFoundItemResponse = { item: FoundItem };

export type StoreLostPayload = {
  guest_name: string;
  telephone: string;
  email?: string;
  item_name: string;
  location: string;
  lost_date: string;
  lost_time?: string;
  additional_notes?: string;
  status: string;
  file_upload?: { uri: string; name: string; type: string }[];
};

export type StoreFoundPayload = {
  finder_name: string;
  telephone: string;
  email?: string;
  item_name: string;
  location: string;
  found_date: string;
  found_time?: string;
  additional_notes?: string;
  status: string;
  file_upload?: { uri: string; name: string; type: string }[];
};

export type UpdateLostPayload = {
  id: number;
  guest_name?: string;
  telephone?: string;
  email?: string;
  item_name?: string;
  location?: string;
  lost_date?: string;
  lost_time?: string;
  additional_notes?: string;
  status?: string;
  file_upload?: { uri: string; name: string; type: string }[];
};

export type UpdateFoundPayload = {
  id: number;
  finder_name?: string;
  telephone?: string;
  email?: string;
  item_name?: string;
  location?: string;
  found_date?: string;
  found_time?: string;
  additional_notes?: string;
  status?: string;
  file_upload?: { uri: string; name: string; type: string }[];
};

/* =======================
   HELPERS
======================= */

/** Parse JSON-stringified file_path → array of image URLs */
export const parseImageUrls = (filePath: string | null): string[] => {
  if (!filePath) return [];
  try {
    const paths = JSON.parse(filePath) as string[];
    if (!paths.length) return [];
    const baseUrl = BASE_URL.replace("/api", "") + "/storage/";
    return paths.map(path => `${baseUrl}${path.replace(/\\/g, '/')}`);
  } catch {
    return [];
  }
};

/** Parse JSON-stringified file_path → first image URL or null (for backward compatibility) */
export const parseImageUrl = (filePath: string | null): string | null => {
  const urls = parseImageUrls(filePath);
  return urls.length > 0 ? urls[0] : null;
};

/* =======================
   SERVICE
======================= */

const lostFoundService = {
  /* ── GET Lost Items ─────────────────────────────────────────────── */
  getLostItems: async (): Promise<LostItemsResponse> => {
    const { data } = await api.post("/lost_found/lostview");
    return data;
  },

  /* ── GET Found Items ────────────────────────────────────────────── */
  getFoundItems: async (): Promise<FoundItemsResponse> => {
    const { data } = await api.post("/lost_found/foundview");
    return data;
  },

  /* ── GET Single Lost Item ───────────────────────────────────────── */
  getLostItemById: async (id: number): Promise<SingleLostItemResponse> => {
    const { data } = await api.get(`/lost_found/lost_get_item?id=${id}`);
    return data;
  },

  /* ── GET Single Found Item ──────────────────────────────────────── */
  getFoundItemById: async (id: number): Promise<SingleFoundItemResponse> => {
    const { data } = await api.get(`/lost_found/edit_found?id=${id}`);
    return data;
  },

  /* ── Store Lost Item (multipart/form-data) ──────────────────────── */
  storeLostItem: async (payload: StoreLostPayload): Promise<any> => {
    const formData = new FormData();

    formData.append("guest_name", payload.guest_name);
    formData.append("telephone", payload.telephone);
    if (payload.email) formData.append("email", payload.email);
    formData.append("item_name", payload.item_name);
    formData.append("location", payload.location);
    formData.append("lost_date", payload.lost_date);
    if (payload.lost_time) formData.append("lost_time", payload.lost_time);
    if (payload.additional_notes) formData.append("additional_notes", payload.additional_notes);
    formData.append("status", payload.status);

    if (payload.file_upload && payload.file_upload.length > 0) {
      const file = payload.file_upload[0];
      formData.append("file_upload[]", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    }

    const { data } = await api.post("/lost_found/storeLost", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /* ── Store Found Item (multipart/form-data) ─────────────────────── */
  storeFoundItem: async (payload: StoreFoundPayload): Promise<any> => {
    const formData = new FormData();

    formData.append("finder_name", payload.finder_name);
    formData.append("telephone", payload.telephone);
    if (payload.email) formData.append("email", payload.email);
    formData.append("item_name", payload.item_name);
    formData.append("location", payload.location);
    formData.append("found_date", payload.found_date);
    if (payload.found_time) formData.append("found_time", payload.found_time);
    if (payload.additional_notes) formData.append("additional_notes", payload.additional_notes);
    formData.append("status", payload.status);

    if (payload.file_upload && payload.file_upload.length > 0) {
      const file = payload.file_upload[0];
      formData.append("file_upload[]", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    }

    const { data } = await api.post("/lost_found/foundStore", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /* ── Update Lost Item ───────────────────────────────────────────── */
  updateLostItem: async (payload: UpdateLostPayload): Promise<any> => {
    const formData = new FormData();
    
    formData.append("id", payload.id.toString());
    if (payload.guest_name) formData.append("guest_name", payload.guest_name);
    if (payload.telephone) formData.append("telephone", payload.telephone);
    if (payload.email) formData.append("email", payload.email);
    if (payload.item_name) formData.append("item_name", payload.item_name);
    if (payload.location) formData.append("location", payload.location);
    if (payload.lost_date) formData.append("lost_date", payload.lost_date);
    if (payload.lost_time) formData.append("lost_time", payload.lost_time);
    if (payload.additional_notes) formData.append("additional_notes", payload.additional_notes);
    if (payload.status) formData.append("status", payload.status);

    if (payload.file_upload && payload.file_upload.length > 0) {
      const file = payload.file_upload[0];
      formData.append("file_upload[]", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    }

    const { data } = await api.post("/lost_found/lost_item_update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /* ── Update Found Item ──────────────────────────────────────────── */
  updateFoundItem: async (payload: UpdateFoundPayload): Promise<any> => {
    const formData = new FormData();
    
    formData.append("id", payload.id.toString());
    if (payload.finder_name) formData.append("finder_name", payload.finder_name);
    if (payload.telephone) formData.append("telephone", payload.telephone);
    if (payload.email) formData.append("email", payload.email);
    if (payload.item_name) formData.append("item_name", payload.item_name);
    if (payload.location) formData.append("location", payload.location);
    if (payload.found_date) formData.append("found_date", payload.found_date);
    if (payload.found_time) formData.append("found_time", payload.found_time);
    if (payload.additional_notes) formData.append("additional_notes", payload.additional_notes);
    if (payload.status) formData.append("status", payload.status);

    if (payload.file_upload && payload.file_upload.length > 0) {
      const file = payload.file_upload[0];
      formData.append("file_upload[]", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    }

    const { data } = await api.post("/lost_found/edit_found_save", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /* ── Delete Lost Item ───────────────────────────────────────────── */
  deleteLostItem: async (id: number): Promise<any> => {
    const { data } = await api.post("/lost_found/lost_destroy", { id });
    return data;
  },

  /* ── Delete Found Item ──────────────────────────────────────────── */
  deleteFoundItem: async (id: number): Promise<any> => {
    const { data } = await api.post("/lost_found/found_destroy", { id });
    return data;
  },

  /* ── Update Found Item Status ───────────────────────────────────── */
  updateFoundItemStatus: async (id: number, status: string): Promise<any> => {
    const { data } = await api.post("/lost_found/found_update_status", { id, status });
    return data;
  },
};

export default lostFoundService;