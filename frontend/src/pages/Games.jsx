import React, { useEffect, useMemo, useState } from 'react'
import { axiosInstance } from '../lib/axios'
import { Link } from 'react-router-dom'
import { Star, Heart } from 'lucide-react'

export default function Games() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [summaries, setSummaries] = useState({}) // { [gameId]: { averageRating, totalReviews } }
  const [mode, setMode] = useState('rated') // 'rated' | 'wishlisted'
  const [topWish, setTopWish] = useState([]) // [{ game, count }]
  const [loadingWish, setLoadingWish] = useState(false)

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true)
      try {
        const res = await axiosInstance.get('/gameUpload/games')
        setGames(res.data || [])
      } catch (e) {
        setGames([])
      } finally {
        setLoading(false)
      }
    }
    loadGames()
  }, [])

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
        )
        const map = {}
        results.forEach(({ id, data }) => {
          map[id] = {
            averageRating: Number(data?.averageRating || 0),
            totalReviews: Number(data?.totalReviews || 0),
          }
        })
        setSummaries(map)
      } catch {
        // ignore
      }
    }
    if (games.length) loadSummaries()
  }, [games])

  useEffect(() => {
    const loadTopWish = async () => {
      setLoadingWish(true)
      try {
        const res = await axiosInstance.get('/wishlist/top')
        setTopWish(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        setTopWish([])
      } finally {
        setLoadingWish(false)
      }
    }
    // Preload on mount
    loadTopWish()
  }, [])

  const leaderboard = useMemo(() => {
    const withScores = games
      .map((g) => ({
        game: g,
        ...(summaries[g._id] || { averageRating: 0, totalReviews: 0 }),
      }))
      .filter((g) => g.totalReviews >= 5)
      .sort((a, b) => b.averageRating - a.averageRating || b.totalReviews - a.totalReviews)
      .slice(0, 50)
    return withScores
  }, [games, summaries])

  const wishboard = useMemo(() => {
    return (topWish || [])
      .filter((x) => x?.game)
      .sort((a, b) => b.count - a.count)
      .slice(0, 50)
  }, [topWish])

  return (
    <div className="min-h-screen bg-[#F8EDDB] px-4 py-12 text-[#2b2b2b]">
      <div className="mx-auto w-full max-w-5xl bg-[#fffdf7] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-[#efe7dc] p-6">
        <h1 className="text-2xl md:text-3xl font-semibold mb-1">Leaderboard</h1>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#6b6b6b]">
            {mode === 'rated' ? 'Highest rated games (min 5 reviews)' : 'Most wishlisted games'}
          </p>
          <div className="inline-flex rounded-full border border-[#efdac6] bg-white overflow-hidden">
            <button
              className={`px-3 py-1 text-xs ${mode === 'rated' ? 'bg-[#ffe7d2] text-[#8a5a3b]' : 'text-[#6b6b6b]'}`}
              onClick={() => setMode('rated')}
            >
              Highest Rated
            </button>
            <button
              className={`px-3 py-1 text-xs ${mode === 'wishlisted' ? 'bg-[#ffe7d2] text-[#8a5a3b]' : 'text-[#6b6b6b]'}`}
              onClick={() => setMode('wishlisted')}
            >
              Most Wishlisted
            </button>
          </div>
        </div>

        {mode === 'rated' ? (
          loading ? (
            <div className="text-sm text-[#6b6b6b]">Loading games…</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-sm text-[#6b6b6b]">No games meet the minimum of 5 reviews yet.</div>
          ) : (
            <ol className="divide-y divide-[#f0e6d9]">
              {leaderboard.map((entry, idx) => (
                <li key={entry.game._id} className="py-3">
                  <Link to={`/game/${entry.game._id}`} className="flex items-center gap-4 group">
                    <div className="w-10 text-center font-semibold text-[#8a5a3b]">{idx + 1}</div>
                    <div className="h-14 w-24 rounded-lg overflow-hidden bg-[#e9e2d4] border border-[#efdac6]">
                      {entry.game.coverUrl && (
                        <img src={entry.game.coverUrl} alt={entry.game.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:underline">{entry.game.title}</p>
                      <div className="text-xs text-[#6b6b6b] truncate">{(entry.game.genres || []).join(' • ')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1 text-[#f59e0b]">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-semibold text-[#2b2b2b]">{entry.averageRating.toFixed(2)}</span>
                      </div>
                      <span className="text-xs text-[#6b6b6b]">({entry.totalReviews})</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )
        ) : (
          loadingWish ? (
            <div className="text-sm text-[#6b6b6b]">Loading most wishlisted…</div>
          ) : wishboard.length === 0 ? (
            <div className="text-sm text-[#6b6b6b]">No wishlists have been created yet.</div>
          ) : (
            <ol className="divide-y divide-[#f0e6d9]">
              {wishboard.map((entry, idx) => (
                <li key={entry.game._id} className="py-3">
                  <Link to={`/game/${entry.game._id}`} className="flex items-center gap-4 group">
                    <div className="w-10 text-center font-semibold text-[#8a5a3b]">{idx + 1}</div>
                    <div className="h-14 w-24 rounded-lg overflow-hidden bg-[#e9e2d4] border border-[#efdac6]">
                      {entry.game.coverUrl && (
                        <img src={entry.game.coverUrl} alt={entry.game.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:underline">{entry.game.title}</p>
                      <div className="text-xs text-[#6b6b6b] truncate">{(entry.game.genres || []).join(' • ')}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 text-[#a43b3b]">
                      <Heart className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold text-[#2b2b2b]">{entry.count}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )
        )}
      </div>
    </div>
  )
}
