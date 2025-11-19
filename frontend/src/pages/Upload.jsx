import React, { useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { CloudUpload, ChevronDown, X, Tag, Sparkles, Brain } from 'lucide-react'
import { axiosInstance } from '../lib/axios'

export default function Upload() {
const { authUser, uploadGame, isUploadingGame } = useAuthStore()
const [title, setTitle] = useState('')
const [description, setDescription] = useState('')
const [video, setVideo] = useState('')
const [website, setWebsite] = useState('')
const [download, setDownload] = useState('')
const [tagInput, setTagInput] = useState('')
const [tags, setTags] = useState(['Pixel Art', 'Roguelike'])
const [genresOpen, setGenresOpen] = useState(false)
const [genres, setGenres] = useState([])
const [cover, setCover] = useState(null)
const [banner, setBanner] = useState(null)
const [isGeneratingTags, setIsGeneratingTags] = useState(false)
const [isEnhancingDesc, setIsEnhancingDesc] = useState(false)

const dropRef = useRef(null)
const inputRef = useRef(null)
const dropRefBanner = useRef(null)
const inputRefBanner = useRef(null)

const allGenres = [
'Action',
'Adventure',
'RPG',
'Roguelike',
'Puzzle',
'Platformer',
'Strategy',
'Simulation',
'Horror',
'Shooter',
]

const addTag = (value) => {
const v = value.trim()
if (!v) return
if (!tags.includes(v)) setTags((t) => [...t, v])
}

const handleTagKey = (e) => {
if (e.key === 'Enter') {
e.preventDefault()
addTag(tagInput)
setTagInput('')
} else if (e.key === 'Backspace' && !tagInput && tags.length) {
setTags((t) => t.slice(0, -1))
}
}

const toggleGenre = (g) => {
setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
}

const onDrop = (files) => {
if (!files || !files.length) return
const f = files[0]
if (!['image/png', 'image/jpeg', 'image/gif'].includes(f.type)) return
setCover(Object.assign(f, { preview: URL.createObjectURL(f) }))
}

const handleDrag = (e) => {
e.preventDefault()
e.stopPropagation()
if (e.type === 'dragenter' || e.type === 'dragover') {
dropRef.current?.classList.add('ring-2', 'ring-purple-500')
} else if (e.type === 'dragleave') {
dropRef.current?.classList.remove('ring-2', 'ring-purple-500')
}
}

const handleDrop = (e) => {
e.preventDefault()
e.stopPropagation()
dropRef.current?.classList.remove('ring-2', 'ring-purple-500')
onDrop(e.dataTransfer.files)
}

const onDropBanner = (files) => {
if (!files || !files.length) return
const f = files[0]
if (!['image/png', 'image/jpeg', 'image/gif'].includes(f.type)) return
setBanner(Object.assign(f, { preview: URL.createObjectURL(f) }))
}

const handleDragBanner = (e) => {
e.preventDefault()
e.stopPropagation()
if (e.type === 'dragenter' || e.type === 'dragover') {
dropRefBanner.current?.classList.add('ring-2', 'ring-purple-500')
} else if (e.type === 'dragleave') {
dropRefBanner.current?.classList.remove('ring-2', 'ring-purple-500')
}
}

const handleDropBanner = (e) => {
e.preventDefault()
e.stopPropagation()
dropRefBanner.current?.classList.remove('ring-2', 'ring-purple-500')
onDropBanner(e.dataTransfer.files)
}

const removeCover = () => {
if (cover?.preview) URL.revokeObjectURL(cover.preview)
setCover(null)
}

const removeBanner = () => {
if (banner?.preview) URL.revokeObjectURL(banner.preview)
setBanner(null)
}

// 🧠 Generate tags & genres using AI
const generateTagsAndGenres = async () => {
if (!title || !description) {
alert('Please enter both title and description first.')
return
}
setIsGeneratingTags(true)
try {
const { data } = await axiosInstance.post('/ai/suggest', { title, description })
if (data.tags) setTags(data.tags)
if (data.genres) setGenres(data.genres)
} catch (err) {
console.error(err)
alert('Failed to generate tags and genres.')
} finally {
setIsGeneratingTags(false)
}
}

// ✨ Enhance description using AI
const enhanceDescription = async () => {
if (!description) {
alert('Please enter a description first.')
return
}
setIsEnhancingDesc(true)
try {
const { data } = await axiosInstance.post('/ai/enhance', { title, description })
if (data.enhancedDescription) setDescription(data.enhancedDescription)
} catch (err) {
console.error(err)
alert('Failed to enhance description.')
} finally {
setIsEnhancingDesc(false)
}
}

const submit = async (e) => {
e.preventDefault()
if (!authUser) return
await uploadGame({ title, description, video, website, download, tags, genres, cover, banner })
setTitle('')
setDescription('')
setVideo('')
setTags([])
setGenres([])
setWebsite('')
setDownload('')
if (cover?.preview) URL.revokeObjectURL(cover.preview)
if (banner?.preview) URL.revokeObjectURL(banner.preview)
setCover(null)
setBanner(null)
}

return (
  <div className="min-h-screen bg-gray-50 px-4 py-10">
    <div className="mx-auto w-full max-w-5xl">
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
        <div className="space-y-1 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Submit Your Game</h1>
          <p className="text-gray-500">Share a new discovery with the community.</p>
        </div>

        {!authUser && <div className="text-gray-700">Please log in to upload.</div>}

        {authUser && (
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the game's official name"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tags</label>
              <div className="rounded-lg border border-gray-200 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-purple-600">
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 px-2.5 py-1 text-sm"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => setTags((x) => x.filter((y) => y !== t))}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-2 flex-1 min-w-[180px]">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKey}
                      placeholder="Add tags and press enter..."
                      className="w-full outline-none text-gray-900 placeholder:text-gray-400"
                    />
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={generateTagsAndGenres}
                disabled={isGeneratingTags}
                className="flex items-center gap-2 text-purple-600 text-sm font-medium hover:underline mt-1 disabled:opacity-50"
              >
                <Brain className="h-4 w-4" />
                {isGeneratingTags ? 'Generating with AI…' : 'Suggest Tags & Genres with AI'}
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief summary of the game's premise and gameplay."
                rows={5}
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="button"
                onClick={enhanceDescription}
                disabled={isEnhancingDesc}
                className="flex items-center gap-2 text-purple-600 text-sm font-medium hover:underline mt-1 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {isEnhancingDesc ? 'Enhancing with AI…' : 'Enhance Description with AI'}
              </button>
            </div>

            {/* Video */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Video Link</label>
              <input
                type="url"
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* Website & Download */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Website Link (optional)</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://studio-website.com"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Download Link (Steam)</label>
              <input
                type="url"
                value={download}
                onChange={(e) => setDownload(e.target.value)}
                placeholder="https://store.steampowered.com/app/..."
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* Genres */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Genre(s)</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setGenresOpen((o) => !o)}
                  className="w-full inline-flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-left text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <span className="truncate">{genres.length ? genres.join(', ') : 'Select one or more genres'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                {genresOpen && (
                  <div className="absolute z-10 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-sm p-2 max-h-56 overflow-auto">
                    {allGenres.map((g) => (
                      <label
                        key={g}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                          checked={genres.includes(g)}
                          onChange={() => toggleGenre(g)}
                        />
                        <span className="text-gray-800">{g}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Cover Image</label>
              <p className="text-xs text-gray-500">PNG, JPG or GIF (800×400 recommended)</p>
              <div
                ref={dropRef}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className="group flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center hover:border-purple-300 transition-colors h-44"
              >
                <div className="space-y-2 w-full">
                  {cover ? (
                    <div className="relative">
                      <img src={cover.preview} alt="cover" className="h-32 w-full rounded-md object-cover" />
                      <button
                        type="button"
                        onClick={removeCover}
                        className="absolute top-2 right-2 inline-flex items-center rounded-md bg-white/90 px-2 py-1 text-sm font-medium text-gray-700 shadow hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <CloudUpload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        <button
                          type="button"
                          onClick={() => inputRef.current?.click()}
                          className="text-purple-700 font-medium hover:underline"
                        >
                          Click to upload
                        </button>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Max size suggested 2MB</p>
                    </>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    className="hidden"
                    onChange={(e) => onDrop(e.target.files)}
                  />
                </div>
              </div>
            </div>

            {/* Banner Image */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Banner Image</label>
              <p className="text-xs text-gray-500">PNG, JPG or GIF (1600×400 recommended)</p>
              <div
                ref={dropRefBanner}
                onDragEnter={handleDragBanner}
                onDragOver={handleDragBanner}
                onDragLeave={handleDragBanner}
                onDrop={handleDropBanner}
                className="group flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center hover:border-purple-300 transition-colors h-44"
              >
                <div className="space-y-2 w-full">
                  {banner ? (
                    <div className="relative">
                      <img src={banner.preview} alt="banner" className="h-32 w-full rounded-md object-cover" />
                      <button
                        type="button"
                        onClick={removeBanner}
                        className="absolute top-2 right-2 inline-flex items-center rounded-md bg-white/90 px-2 py-1 text-sm font-medium text-gray-700 shadow hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <CloudUpload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        <button
                          type="button"
                          onClick={() => inputRefBanner.current?.click()}
                          className="text-purple-700 font-medium hover:underline"
                        >
                          Click to upload
                        </button>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Max size suggested 3MB</p>
                    </>
                  )}
                  <input
                    ref={inputRefBanner}
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    className="hidden"
                    onChange={(e) => onDropBanner(e.target.files)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploadingGame}
              className={`w-full inline-flex items-center justify-center rounded-xl py-3.5 text-white font-semibold shadow-[0_4px_12px_rgba(79,44,245,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
                isUploadingGame
                  ? 'bg-[#7b68ee] cursor-not-allowed'
                  : 'bg-[#4F2CF5] hover:bg-[#4322f0] focus-visible:ring-[#4F2CF5]'
              }`}
            >
              {isUploadingGame ? 'Uploading…' : 'Submit Game'}
            </button>
          </div>
        </form>
      )}
    </div>
  </div>
</div>

)
}