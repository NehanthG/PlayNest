import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Star, Heart } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";


export default function GameVaultDashboardPreview() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [summaries, setSummaries] = useState({}); // { [gameId]: { averageRating, totalReviews } }
  const { authUser, wishlistGames, isLoadingWishlist, fetchWishlist, toggleWishlist, isTogglingWishlist } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/gameUpload/games");
        setGames(res.data || []);
      } catch (e) {
        console.log(e);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (authUser) fetchWishlist();
  }, [authUser, fetchWishlist]);

  useEffect(() => {
    const loadDiscovery = async () => {
      setLoadingDiscovery(true);
      try {
        const [r1, r2, r3] = await Promise.all([
          axiosInstance.get("/discovery/recent").catch(() => ({ data: [] })),
          axiosInstance.get("/discovery/top-rated").catch(() => ({ data: [] })),
          axiosInstance.get("/discovery/trending").catch(() => ({ data: [] })),
        ]);
        setRecent(Array.isArray(r1.data) ? r1.data : []);
        setTopRated(Array.isArray(r2.data) ? r2.data : []);
        setTrending(Array.isArray(r3.data) ? r3.data : []);
        if (authUser) {
          const r4 = await axiosInstance.get("/discovery/recommended").catch(() => ({ data: [] }));
          setRecommended(Array.isArray(r4.data) ? r4.data : []);
        } else {
          setRecommended([]);
        }
      } finally {
        setLoadingDiscovery(false);
      }
    };
    loadDiscovery();
  }, [authUser]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axiosInstance.get(`/gameUpload/games/search?q=${encodeURIComponent(q)}`);
        setSearchResults(Array.isArray(res.data) ? res.data : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        const results = await Promise.all(
          games.map((g) =>
            axiosInstance
              .get(`/review/${g._id}/summary`)
              .then((res) => ({ id: g._id, data: res.data }))
              .catch(() => ({ id: g._id, data: { averageRating: 0, totalReviews: 0 } }))
          )
        );
        const map = {};
        results.forEach(({ id, data }) => {
          map[id] = {
            averageRating: Number(data?.averageRating || 0),
            totalReviews: Number(data?.totalReviews || 0),
          };
        });
        setSummaries(map);
      } catch (e) {
        // ignore
      }
    };
    if (games.length) loadSummaries();
  }, [games]);

  const renderCard = (game, keyPrefix = "") => {
    const id = game?._id;
    const wish = id && wishlistGames?.some((g) => g?._id === id);
    const cover = game?.coverUrl || game?.coverName;
    return (
      <Link
        to={id ? `/game/${id}` : `#`}
        key={`${keyPrefix}${id || Math.random()}`}
        className="w-72 flex-none bg-[#fffdf7] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4 border border-[#efe7dc] hover:shadow-[0_6px_14px_rgba(0,0,0,0.1)] transition-transform transform hover:-translate-y-1 relative"
      >
        <button
          aria-label="Toggle wishlist"
          className={`absolute right-3 top-3 inline-flex items-center justify-center h-8 w-8 rounded-full border shadow-sm ${
            wish ? 'bg-[#ffd5cc] text-[#a43b3b] border-[#f3b8aa]' : 'bg-white text-[#a45d3b] border-[#efd7c1]'
          }`}
          disabled={isTogglingWishlist}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!id) return;
            if (!authUser) return;
            await toggleWishlist(id);
          }}
        >
          <Heart className={`h-4 w-4 ${wish ? 'fill-current' : ''}`} />
        </button>

        <div className="w-full h-40 bg-[#e6dfd1] rounded-lg mb-4 overflow-hidden">
          {cover && (
            <img src={cover} alt={game?.title} className="w-full h-full object-cover" />
          )}
        </div>
        <h3 className="font-semibold text-lg text-[#2b2b2b] mb-2">{game?.title || "Loading..."}</h3>
        {id && (
          <div className="flex items-center gap-1 text-[#6b6b6b] mb-2">
            <Star className="h-4 w-4 text-[#f59e0b] fill-current" />
            <span className="text-xs">
              {summaries[id]
                ? `${summaries[id].averageRating.toFixed(1)} / 5 (${summaries[id].totalReviews})`
                : "—"}
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          {(game?.genres || []).slice(0, 3).map((tag) => (
            <span
              key={`${keyPrefix}${id}-${tag}`}
              className="px-3 py-0.5 text-xs rounded-full bg-[#f5ede0] text-[#a86e4f] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-[#5b5b5b] leading-relaxed line-clamp-3">{game?.description || ""}</p>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8EDDB] text-[#2b2b2b] font-[Inter]">
      
      <main className="max-w-6xl mx-auto py-16 px-6">
        <div className="mb-8">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games by title, tag, or genre"
            className="w-full rounded-xl border border-[#efdac6] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e7c7a5]"
          />
        </div>
        {searchQuery.trim() && (
          <>
            <h2 className="text-3xl font-semibold mb-6 text-[#2b2b2b]">Search Results</h2>
            {searching ? (
              <div className="text-sm text-[#6b6b6b] mb-10">Searching…</div>
            ) : searchResults.length === 0 ? (
              <div className="text-sm text-[#6b6b6b] mb-10">No matches found.</div>
            ) : (
              <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-soft mb-12">
                {searchResults.map((g) => renderCard(g, "search-"))}
              </div>
            )}
          </>
        )}
        {authUser && (isLoadingWishlist || (wishlistGames && wishlistGames.length > 0)) && (
          <>
            <h2 className="text-3xl font-semibold mb-6 text-[#2b2b2b]">Your Wishlist</h2>
            {isLoadingWishlist ? (
              <div className="text-sm text-[#6b6b6b] mb-10">Loading wishlist…</div>
            ) : (
              <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-soft mb-12">
                {wishlistGames.map((game) => (
                  <Link
                    to={`/game/${game._id}`}
                    key={`wl-${game._id}`}
                    className="w-72 flex-none bg-[#fffdf7] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4 border border-[#efe7dc] hover:shadow-[0_6px_14px_rgba(0,0,0,0.1)] transition-transform transform hover:-translate-y-1"
                  >
                    <div className="w-full h-40 bg-[#e6dfd1] rounded-lg mb-4 overflow-hidden">
                      {game?.coverUrl && (
                        <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-[#2b2b2b] mb-2">{game?.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(game?.genres || []).slice(0, 3).map((tag) => (
                        <span
                          key={`wl-${game._id}-${tag}`}
                          className="px-3 py-0.5 text-xs rounded-full bg-[#f5ede0] text-[#a86e4f] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-[#5b5b5b] leading-relaxed line-clamp-3">{game?.description || ""}</p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
        <h2 className="text-3xl font-semibold mb-6 text-[#2b2b2b]">Recently Uploaded</h2>
        <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-soft mb-12">
          {(loadingDiscovery ? Array.from({ length: 6 }) : recent).map((game, idx) => (
            game ? renderCard(game, "recent-") : <div key={`recent-skel-${idx}`} className="w-72 h-60 bg-[#fffdf7] rounded-xl border border-[#efe7dc]" />
          ))}
        </div>

        <h2 className="text-3xl font-semibold mb-6 text-[#2b2b2b]">Top Rated</h2>
        <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-soft mb-12">
          {(loadingDiscovery ? Array.from({ length: 6 }) : topRated).map((game, idx) => (
            game ? renderCard(game, "top-") : <div key={`top-skel-${idx}`} className="w-72 h-60 bg-[#fffdf7] rounded-xl border border-[#efe7dc]" />
          ))}
        </div>

        <h2 className="text-3xl font-semibold mb-6 text-[#2b2b2b]">Trending</h2>
        <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-soft mb-12">
          {(loadingDiscovery ? Array.from({ length: 6 }) : trending).map((game, idx) => (
            game ? renderCard(game, "trend-") : <div key={`trend-skel-${idx}`} className="w-72 h-60 bg-[#fffdf7] rounded-xl border border-[#efe7dc]" />
          ))}
        </div>

        {authUser && (
          <>
            <h2 className="text-3xl font-semibold mb-6 text-[#2b2b2b]">Recommended For You</h2>
            <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-soft mb-12">
              {(loadingDiscovery ? Array.from({ length: 6 }) : recommended).map((game, idx) => (
                game ? renderCard(game, "rec-") : <div key={`rec-skel-${idx}`} className="w-72 h-60 bg-[#fffdf7] rounded-xl border border-[#efe7dc]" />
              ))}
            </div>
          </>
        )}
        <h2 className="text-3xl font-semibold mb-10 text-[#2b2b2b]">Featured Indie Games</h2>
        <div className="flex flex-nowrap gap-6 overflow-x-auto pb-2 scrollbar-soft">
          {(loading ? Array.from({ length: 4 }) : games).map((game, idx) => {
            const id = game?._id
            const wish = id && wishlistGames?.some((g) => g?._id === id)
            return (
              <Link
                to={id ? `/game/${id}` : `#`}
                key={id || idx}
                className="w-72 flex-none bg-[#fffdf7] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4 border border-[#efe7dc] hover:shadow-[0_6px_14px_rgba(0,0,0,0.1)] transition-transform transform hover:-translate-y-1 relative"
              >
                <button
                  aria-label="Toggle wishlist"
                  className={`absolute right-3 top-3 inline-flex items-center justify-center h-8 w-8 rounded-full border shadow-sm ${
                    wish ? 'bg-[#ffd5cc] text-[#a43b3b] border-[#f3b8aa]' : 'bg-white text-[#a45d3b] border-[#efd7c1]'
                  }`}
                  disabled={isTogglingWishlist}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!id) return;
                    if (!authUser) return; // keep user on page; login gate is handled elsewhere
                    await toggleWishlist(id);
                  }}
                >
                  <Heart className={`h-4 w-4 ${wish ? 'fill-current' : ''}`} />
                </button>

                <div className="w-full h-40 bg-[#e6dfd1] rounded-lg mb-4 overflow-hidden">
                  {game?.coverUrl && (
                    <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <h3 className="font-semibold text-lg text-[#2b2b2b] mb-2">{game?.title || "Loading..."}</h3>
                {id && (
                  <div className="flex items-center gap-1 text-[#6b6b6b] mb-2">
                    <Star className="h-4 w-4 text-[#f59e0b] fill-current" />
                    <span className="text-xs">
                      {summaries[id]
                        ? `${summaries[id].averageRating.toFixed(1)} / 5 (${summaries[id].totalReviews})`
                        : "—"}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(game?.genres || []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-0.5 text-xs rounded-full bg-[#f5ede0] text-[#a86e4f] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-[#5b5b5b] leading-relaxed line-clamp-3">{game?.description || ""}</p>
              </Link>
            )
          })}
        </div>

      </main>
    </div>
  );
}
