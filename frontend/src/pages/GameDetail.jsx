import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ExternalLink, Play, Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import { axiosInstance } from '../lib/axios'
import { useAuthStore } from '../store/useAuthStore'

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [summaryLoading, setSummaryLoading] = useState(true)
  const { authUser, wishlistGames, isTogglingWishlist, fetchWishlist, toggleWishlist } = useAuthStore()
  const [reactingId, setReactingId] = useState(null)

  const isWishlisted = useMemo(() => {
    if (!id) return false
    return (wishlistGames || []).some((g) => g?._id === id)
  }, [wishlistGames, id])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/gameUpload/games/${id}`)
        setGame(res.data)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true)
      try {
        const res = await axiosInstance.get(`/review/${id}`)
        setReviews(res.data || [])
      } catch (e) {
        console.log(e)
      } finally {
        setReviewsLoading(false)
      }
    }
    if (id) loadReviews()
  }, [id])

  useEffect(() => {
    if (authUser) {
      fetchWishlist()
    }
  }, [authUser, fetchWishlist])

  const loadSummary = async () => {
    setSummaryLoading(true)
    try {
      const res = await axiosInstance.get(`/review/${id}/summary`)
      setSummary({
        averageRating: Number(res.data?.averageRating || 0),
        totalReviews: Number(res.data?.totalReviews || 0),
      })
    } catch (e) {
      // Keep defaults on error (e.g., unauthorized or no reviews)
      setSummary({ averageRating: 0, totalReviews: 0 })
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    if (id) loadSummary()
  }, [id])

  const submitReview = async (e) => {
    e.preventDefault()
    if (!rating || !comment.trim()) return
    setSubmitting(true)
    try {
      const res = await axiosInstance.post(`/review/${id}`, { rating: Number(rating), comment: comment.trim() })
      const created = res.data?.review
      if (created) {
        setReviews((prev) => [{ ...created, userId: authUser }, ...prev])
        setRating(5)
        setComment('')
        loadSummary()
      }
    } catch (e) {
      console.log(e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return
    setDeletingId(reviewId)
    try {
      await axiosInstance.delete(`/review/${reviewId}`)
      setReviews((prev) => prev.filter((r) => r._id !== reviewId))
      loadSummary()
    } catch (e) {
      console.log(e)
    } finally {
      setDeletingId(null)
    }
  }

  const toggleReaction = async (reviewId, action) => {
    if (!authUser) return navigate('/login')
    const prev = reviews
    const idx = prev.findIndex((r) => r._id === reviewId)
    if (idx === -1) return
    const r = prev[idx]
    const userId = authUser._id
    const liked = Array.isArray(r.likes) && r.likes.some((u) => String(u) === String(userId))
    const disliked = Array.isArray(r.dislikes) && r.dislikes.some((u) => String(u) === String(userId))

    // Build optimistic next review
    let next = { ...r, likes: Array.isArray(r.likes) ? [...r.likes] : [], dislikes: Array.isArray(r.dislikes) ? [...r.dislikes] : [] }
    if (action === 'like') {
      if (liked) {
        next.likes = next.likes.filter((u) => String(u) !== String(userId))
      } else {
        next.likes.push(userId)
        if (disliked) next.dislikes = next.dislikes.filter((u) => String(u) !== String(userId))
      }
    } else if (action === 'dislike') {
      if (disliked) {
        next.dislikes = next.dislikes.filter((u) => String(u) !== String(userId))
      } else {
        next.dislikes.push(userId)
        if (liked) next.likes = next.likes.filter((u) => String(u) !== String(userId))
      }
    }

    // Optimistic UI
    setReviews((prevAll) => {
      const copy = [...prevAll]
      copy[idx] = next
      return copy
    })
    setReactingId(reviewId)
    try {
      const res = await axiosInstance.post(`/review/${reviewId}/${action}`)
      // Optionally sync counts with server
      const { likesCount, dislikesCount } = res.data || {}
      setReviews((prevAll) => {
        const copy = [...prevAll]
        const cur = copy.find((x) => x._id === reviewId)
        if (cur && typeof likesCount === 'number' && typeof dislikesCount === 'number') {
          // We only adjust counts if they differ; arrays already updated
          // No-op since arrays determine counts; kept for future consistency
        }
        return copy
      })
    } catch (e) {
      // Revert on failure
      setReviews(prev)
    } finally {
      setReactingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8EDDB] text-[#2b2b2b]">
      {/* Hero */}
      <section className="relative">
        <div className="h-[320px] w-full overflow-hidden">
          {game?.bannerUrl ? (
            <img src={game.bannerUrl} alt={game?.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[#e6dfd1]" />
          )}
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/10 to-black/30" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow">
              {game?.title || (loading ? 'Loading…' : 'Game')}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base md:text-lg text-white/90">
              {game?.description || ''}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {(game?.genres || []).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/20 text-white backdrop-blur px-3 py-1 text-xs font-semibold border border-white/30"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Media card and actions */}
      <section className="relative z-10 -mt-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-[#eddcc8] bg-[#fffdf7] shadow-[0_10px_30px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="relative">
              {game?.video && game?.coverUrl ? (
                <a href={game.video} target="_blank" rel="noopener noreferrer" className="group block">
                  <img src={game.coverUrl} alt={game?.title} className="w-full h-[360px] object-cover cursor-pointer" />
                  <span
                    aria-hidden
                    className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#2b2b2b] shadow-lg group-hover:bg-white"
                  >
                    <Play className="h-7 w-7" />
                  </span>
                </a>
              ) : (
                <>
                  {game?.coverUrl ? (
                    <img src={game.coverUrl} alt={game?.title} className="w-full h-[360px] object-cover" />
                  ) : (
                    <div className="w-full h-[360px] bg-[#e9e2d4]" />
                  )}
                  <button
                    aria-label="Play trailer"
                    className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#2b2b2b] shadow-lg hover:bg-white"
                  >
                    <Play className="h-7 w-7" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={async () => {
                if (!authUser) return navigate('/login')
                await toggleWishlist(id)
              }}
              disabled={isTogglingWishlist}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border shadow-sm ${
                isWishlisted
                  ? 'bg-[#ffd5cc] text-[#a43b3b] border-[#f3b8aa] hover:bg-[#ffc6ba]'
                  : 'bg-[#fff1e3] text-[#a45d3b] border-[#efd7c1] hover:bg-[#ffe7d2]'
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              {isTogglingWishlist ? 'Updating…' : isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
            {game?.download && (
              <a
                href={game.download}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#2b2b2b] text-white px-5 py-2.5 text-sm font-semibold border border-[#2b2b2b] shadow-sm hover:bg-black"
              >
                Download on Steam
              </a>
            )}
            {game?.website && (
              <a
                href={game.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2b2b2b] border border-[#eadfcd] shadow-sm hover:bg-[#fff7ea]"
              >
                Visit Website <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">Community Reviews</h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Star className="h-5 w-5 text-[#f59e0b] fill-current" />
            {summaryLoading ? (
              <span className="text-sm text-[#6b6b6b]">Loading rating summary…</span>
            ) : (
              <span className="text-sm">
                <span className="font-semibold text-[#2b2b2b]">{summary.averageRating.toFixed(1)} / 5</span>
                <span className="text-[#6b6b6b]"> ({summary.totalReviews} review{summary.totalReviews === 1 ? '' : 's'})</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-10">
          {authUser ? (
            <form onSubmit={submitReview} className="rounded-2xl border border-[#eddcc8] bg-[#fffdf7] shadow-sm p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Your rating:</span>
                  <div className="flex items-center gap-1 text-[#f59e0b]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                        className="p-0"
                        aria-label={`Rate ${i + 1}`}
                      >
                        <Star className={`h-5 w-5 ${i < rating ? 'fill-current' : 'opacity-30'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a short review..."
                    className="w-full rounded-lg border border-[#eddcc8] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e7c7a5]"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2b2b2b] text-white px-5 py-2 text-sm font-semibold border border-[#2b2b2b] shadow-sm hover:bg-black disabled:opacity-60"
                  >
                    {submitting ? 'Posting...' : 'Post review'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center text-sm text-[#6b6b6b]">Log in to write a review.</div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {reviewsLoading ? (
            <div className="text-center text-sm text-[#6b6b6b]">Loading reviews…</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-sm text-[#6b6b6b]">No reviews yet. Be the first to review!</div>
          ) : (
            reviews.map((r) => (
              <div
                key={r._id}
                className="rounded-2xl border border-[#eddcc8] bg-[#fffdf7] shadow-sm p-5 md:p-6 flex gap-4 items-start"
              >
                <img
                  src={r?.userId?.profilePic || 'https://via.placeholder.com/40'}
                  alt={r?.userId?.fullName || 'User'}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{r?.userId?.fullName || 'Anonymous'}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[#f59e0b]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < (r.rating || 0) ? 'fill-current' : 'opacity-30'}`}
                          />
                        ))}
                      </div>
                      {authUser && r?.userId?._id === authUser?._id && (
                        <button
                          onClick={() => handleDeleteReview(r._id)}
                          disabled={deletingId === r._id}
                          className="text-xs text-red-600 hover:underline disabled:opacity-60"
                        >
                          {deletingId === r._id ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#5b5b5b]">{r.comment}</p>
                  <div className="mt-3 flex items-center gap-3">
                    {(() => {
                      const userId = authUser?._id
                      const liked = userId && Array.isArray(r.likes) && r.likes.some((u) => String(u) === String(userId))
                      const disliked = userId && Array.isArray(r.dislikes) && r.dislikes.some((u) => String(u) === String(userId))
                      const likesCount = Array.isArray(r.likes) ? r.likes.length : 0
                      const dislikesCount = Array.isArray(r.dislikes) ? r.dislikes.length : 0
                      return (
                        <>
                          <button
                            onClick={() => toggleReaction(r._id, 'like')}
                            disabled={!!reactingId}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${
                              liked ? 'bg-[#e8fff0] text-[#1f7a3e] border-[#bde7cb]' : 'bg-white text-[#2b2b2b] border-[#eadfcd]'
                            }`}
                          >
                            <ThumbsUp className={`h-4 w-4 ${liked ? 'text-[#1f7a3e]' : 'text-[#6b6b6b]'}`} />
                            <span>{likesCount}</span>
                          </button>
                          <button
                            onClick={() => toggleReaction(r._id, 'dislike')}
                            disabled={!!reactingId}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${
                              disliked ? 'bg-[#ffecec] text-[#a43b3b] border-[#f3b8aa]' : 'bg-white text-[#2b2b2b] border-[#eadfcd]'
                            }`}
                          >
                            <ThumbsDown className={`h-4 w-4 ${disliked ? 'text-[#a43b3b]' : 'text-[#6b6b6b]'}`} />
                            <span>{dislikesCount}</span>
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
