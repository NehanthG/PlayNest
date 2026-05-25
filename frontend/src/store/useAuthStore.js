import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";




export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  isUploadingGame: false,
  // wishlist state
  wishlistGames: [], // populated GameUpload docs
  isLoadingWishlist: false,
  isTogglingWishlist: false,
  

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      
    } catch (error) {
      // 401 Unauthorized is expected when no session cookie is present
      if (error?.response?.status !== 401) {
        console.log("Error in checkAuth:", error);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Wishlist: fetch user's wishlist (populated)
  fetchWishlist: async () => {
    set({ isLoadingWishlist: true });
    try {
      const res = await axiosInstance.get("/wishlist");
      set({ wishlistGames: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.log("Error fetching wishlist:", error);
      set({ wishlistGames: [] });
    } finally {
      set({ isLoadingWishlist: false });
    }
  },

  // Wishlist: toggle a game in the wishlist, then refresh list
  toggleWishlist: async (gameId) => {
    if (!gameId) return;
    set({ isTogglingWishlist: true });
    try {
      await axiosInstance.post(`/wishlist/${gameId}/toggle`);
      // Refresh full list to keep populated docs
      await get().fetchWishlist();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update wishlist");
    } finally {
      set({ isTogglingWishlist: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
        
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      // Login response only contains a message; load the full user via checkAuth
      await get().checkAuth();
      toast.success("Logged in successfully");

      
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");

    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  uploadGame: async ({ title, description, video, website, download, tags, genres, cover, banner }) => {
    set({ isUploadingGame: true });
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('video', video);
      if (!download) {
        throw { response: { data: { message: 'Download link is required' } } };
      }
      form.append('download', download);
      form.append('tags', JSON.stringify(tags || []));
      form.append('genres', JSON.stringify(genres || []));
      if (website) form.append('website', website);
      if (cover) form.append('cover', cover);
      if (banner) form.append('banner', banner);

      const res = await axiosInstance.post('/gameUpload/gameUpload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Game uploaded successfully');
      return res.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Upload failed';
      toast.error(message);
      throw error;
    } finally {
      set({ isUploadingGame: false });
    }
  },
}));