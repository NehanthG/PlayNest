import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { ChevronDown, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function Profile() {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [imagePreview, setImagePreview] = useState(authUser?.profilePic || "");
  const [fileDataUrl, setFileDataUrl] = useState("");
  const fileInputRef = useRef(null);
  const [avg, setAvg] = useState({ averageRating: 0, totalReviews: 0 });
  const [loadingAvg, setLoadingAvg] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [loadingUserReviews, setLoadingUserReviews] = useState(false);
  const [openMap, setOpenMap] = useState({}); // { [reviewId]: boolean }
  const [myGames, setMyGames] = useState([]);
  const [loadingMyGames, setLoadingMyGames] = useState(false);

  // Profile fields editing state
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoadingAvg(true);
      try {
        const res = await axiosInstance.get('/review/user/average');
        const a = Number(res.data?.averageRating || 0);
        const t = Number(res.data?.totalReviews || 0);
        setAvg({ averageRating: a, totalReviews: t });
      } catch (e) {
        setAvg({ averageRating: 0, totalReviews: 0 });
      } finally {
        setLoadingAvg(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    // initialize form from authUser
    if (authUser) {
      setFullName(authUser.fullName || "");
      setBio(authUser.bio || "");
      setWebsite(authUser.website || "");
      setLocation(authUser.location || "");
    }
  }, [authUser]);

  useEffect(() => {
    const loadReviews = async () => {
      setLoadingUserReviews(true);
      try {
        const res = await axiosInstance.get('/review/user/reviews');
        setUserReviews(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setUserReviews([]);
      } finally {
        setLoadingUserReviews(false);
      }
    };
    loadReviews();
  }, []);

  useEffect(() => {
    const loadMyGames = async () => {
      setLoadingMyGames(true);
      try {
        const res = await axiosInstance.get('/gameUpload/games/my');
        setMyGames(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setMyGames([]);
      } finally {
        setLoadingMyGames(false);
      }
    };
    loadMyGames();
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result?.toString() || "";
      setImagePreview(result);
      setFileDataUrl(result);
      updateProfile({ profilePic: result });
    };
    reader.readAsDataURL(file);
  };

  const openPicker = () => {
    if (isUpdatingProfile) return;
    fileInputRef.current?.click();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!fileDataUrl) return;
    await updateProfile({ profilePic: fileDataUrl });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-[#2b2b2b]">Profile</h2>
        <p className="text-sm text-[#6b6b6b] mt-1">Update your avatar and view your review stats.</p>
      </div>

      <div className="bg-white/80 border border-[#efdac6] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-5 mb-6">
          <button type="button" onClick={openPicker} className="relative h-20 w-20 rounded-full overflow-hidden bg-[#fde8d7] border border-[#efdac6] flex items-center justify-center cursor-pointer">
            {imagePreview ? (
              <img src={imagePreview} alt="profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[#8a5a3b] font-semibold text-xl">
                {(authUser?.fullName?.[0] || authUser?.email?.[0] || "U").toUpperCase()}
              </span>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            {isUpdatingProfile && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs">Updating...</div>
            )}
          </button>
          <div>
            <p className="text-[#2b2b2b] font-medium text-lg">{authUser?.fullName || authUser?.email}</p>
            <p className="text-[#2b2b2b]/60 text-sm">{authUser?.email}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <button
            type="submit"
            disabled={!fileDataUrl || isUpdatingProfile}
            className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-[#ffe7d2] text-[#8a5a3b] font-medium shadow-sm border border-[#efdac6] hover:bg-[#ffdcbf] disabled:opacity-60"
          >
            {isUpdatingProfile ? "Updating..." : "Save"}
          </button>
        </form>

        <div className="mt-8 rounded-2xl border border-[#efdac6] bg-white/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#2b2b2b]">Profile info</h3>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs rounded-full bg-[#ffe7d2] text-[#8a5a3b] px-3 py-1 border border-[#efdac6] hover:bg-[#ffdcbf]"
              >
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // reset and exit edit
                    setFullName(authUser?.fullName || "");
                    setBio(authUser?.bio || "");
                    setWebsite(authUser?.website || "");
                    setLocation(authUser?.location || "");
                    setErrors({});
                    setEditing(false);
                  }}
                  className="text-xs rounded-full bg-white text-[#7a5a3b] px-3 py-1 border border-[#efdac6] hover:bg-[#fff7ea]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const errs = {};
                    if (!fullName.trim()) errs.fullName = "Full name is required";
                    if (website && !/^https?:\/\//i.test(website)) errs.website = "Must start with http or https";
                    if (bio && bio.length > 300) errs.bio = "Bio must be 300 characters or less";
                    setErrors(errs);
                    if (Object.keys(errs).length) return;
                    await updateProfile({ fullName: fullName.trim(), bio: bio.trim(), website: website.trim(), location: location.trim() });
                    setEditing(false);
                  }}
                  disabled={isUpdatingProfile}
                  className="text-xs rounded-full bg-[#2b2b2b] text-white px-3 py-1 border border-[#2b2b2b] hover:bg-black disabled:opacity-60"
                >
                  {isUpdatingProfile ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6b6b6b] mb-1">Full name</label>
              <input
                type="text"
                value={fullName}
                disabled={!editing}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white ${errors.fullName ? 'border-red-400' : 'border-[#efdac6]'} disabled:opacity-60`}
              />
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-xs text-[#6b6b6b] mb-1">Website</label>
              <input
                type="url"
                value={website}
                disabled={!editing}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white ${errors.website ? 'border-red-400' : 'border-[#efdac6]'} disabled:opacity-60`}
              />
              {errors.website && <p className="text-xs text-red-600 mt-1">{errors.website}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-[#6b6b6b] mb-1">Location</label>
              <input
                type="text"
                value={location}
                disabled={!editing}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-[#efdac6] px-3 py-2 text-sm bg-white disabled:opacity-60"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-[#6b6b6b] mb-1">Bio</label>
              <textarea
                value={bio}
                disabled={!editing}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white ${errors.bio ? 'border-red-400' : 'border-[#efdac6]'} disabled:opacity-60`}
              />
              <div className="flex justify-between text-[11px] mt-1">
                {errors.bio ? <p className="text-red-600">{errors.bio}</p> : <span className="text-[#6b6b6b]">Up to 300 characters</span>}
                <span className={`text-[#6b6b6b] ${bio.length > 300 ? 'text-red-600' : ''}`}>{bio.length}/300</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[#2b2b2b] mb-2">Your review stats</h3>
          {loadingAvg ? (
            <div className="text-sm text-[#6b6b6b]">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#efdac6] bg-white/70 p-4 flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#fff1e3] border border-[#efd7c1] text-[#a45d3b]">
                  <Star className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-[#6b6b6b]">Average rating</p>
                  <p className="text-base font-semibold text-[#2b2b2b]">{avg.averageRating.toFixed(2)} / 5</p>
                </div>
              </div>
              <div className="rounded-xl border border-[#efdac6] bg-white/70 p-4 flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#fff1e3] border border-[#efd7c1] text-[#a45d3b]">{avg.totalReviews}</span>
                <div>
                  <p className="text-xs text-[#6b6b6b]">Total reviews</p>
                  <p className="text-base font-semibold text-[#2b2b2b]">Across all games</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-[#efdac6] bg-white/70 p-4">
          <h3 className="text-sm font-semibold text-[#2b2b2b] mb-3">Your uploads</h3>
          {loadingMyGames ? (
            <div className="text-sm text-[#6b6b6b]">Loading…</div>
          ) : myGames.length === 0 ? (
            <div className="text-sm text-[#6b6b6b]">You haven't uploaded any games yet.</div>
          ) : (
            <ul className="space-y-3">
              {myGames.map((g) => (
                <li key={g._id}>
                  <Link to={`/game/${g._id}`} className="rounded-xl border border-[#efdac6] bg-white/80 p-4 block hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-[#f3e7d9] border border-[#efdac6] shrink-0">
                        {(g.coverUrl || g.coverName) && (
                          <img src={g.coverUrl || g.coverName} alt={g.title} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#2b2b2b] truncate">{g.title}</p>
                        {Array.isArray(g.genres) && g.genres.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {g.genres.slice(0,3).map((x) => (
                              <span key={`${g._id}-${x}`} className="px-2 py-0.5 rounded-full bg-[#f5ede0] text-[#a86e4f] text-[10px] border border-[#efdac6]">
                                {x}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#6b6b6b]">
                          <p>👁️ <strong className="text-[#2b2b2b]">{Number(g.views || 0)}</strong> Views</p>
                          <p>⭐ <strong className="text-[#2b2b2b]">{Number(g.averageRating || 0).toFixed(1)}</strong> Avg Rating</p>
                          <p>💬 <strong className="text-[#2b2b2b]">{Number(g.totalReviews || 0)}</strong> Reviews</p>
                          <p>❤️ <strong className="text-[#2b2b2b]">{Number(g.wishlistCount || 0)}</strong> Wishlists</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[#f59e0b]">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-semibold text-[#2b2b2b]">{Number(g.averageRating || 0).toFixed(2)}</span>
                        </span>
                        <span className="text-xs text-[#6b6b6b]">({Number(g.totalReviews || 0)})</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-[#efdac6] bg-white/70 p-4">
          <h3 className="text-sm font-semibold text-[#2b2b2b] mb-3">Games you reviewed</h3>
          {loadingUserReviews ? (
            <div className="text-sm text-[#6b6b6b]">Loading…</div>
          ) : userReviews.length === 0 ? (
            <div className="text-sm text-[#6b6b6b]">You haven't reviewed any games yet.</div>
          ) : (
            <ul className="space-y-3">
              {userReviews.map((r) => (
                <li key={r._id} className="rounded-xl border border-[#efdac6] bg-white/80 hover:bg-white transition-colors">
                  <button
                    type="button"
                    onClick={() => setOpenMap((m) => ({ ...m, [r._id]: !m[r._id] }))}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-[#f3e7d9] border border-[#efdac6] shrink-0">
                      {r?.game?.coverUrl && (
                        <img src={r.game.coverUrl} alt={r?.game?.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#2b2b2b]">{r?.game?.title || 'Game'}</p>
                      {Array.isArray(r?.game?.genres) && r.game.genres.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {r.game.genres.slice(0,3).map((g) => (
                            <span key={`${r._id}-${g}`} className="px-2 py-0.5 rounded-full bg-[#f5ede0] text-[#a86e4f] text-[10px] border border-[#efdac6]">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs rounded-full bg-[#fff1e3] border border-[#efd7c1] text-[#a45d3b] px-2 py-0.5">
                      {Number(r.rating).toFixed(1)} / 5
                    </span>
                    <ChevronDown className={`h-4 w-4 text-[#8a5a3b] transition-transform ${openMap[r._id] ? 'rotate-180' : ''}`} />
                  </button>
                  {openMap[r._id] && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-[#5b5b5b] leading-relaxed">{r?.comment}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
