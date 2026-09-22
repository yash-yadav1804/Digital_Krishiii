import { useEffect, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

const MAX_SIZE = 5 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ImageUpload({ value, onChange, label = 'Photo', hint = 'JPG, PNG or WebP · max 5 MB' }) {
  const [preview, setPreview] = useState(value || '')

  useEffect(() => {
    setPreview(value || '')
  }, [value])

  const handleChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!TYPES.includes(file.type)) {
      event.target.value = ''
      return
    }

    if (file.size > MAX_SIZE) {
      event.target.value = ''
      return
    }

    onChange(file)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
  }

  const clear = () => {
    onChange(null)
    setPreview('')
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
        {preview ? (
          <div className="relative overflow-hidden rounded-xl">
            <img src={preview} alt="Selected preview" className="w-full h-44 object-cover" />
            <button
              type="button"
              onClick={clear}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-slate-700 grid place-items-center shadow"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center min-h-32 cursor-pointer rounded-xl hover:bg-white transition-colors">
            <ImagePlus className="w-8 h-8 text-emerald-600 mb-2" />
            <span className="text-sm font-semibold text-slate-700">Upload image</span>
            <span className="text-xs text-slate-400 mt-1">{hint}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleChange}
            />
          </label>
        )}
      </div>
    </div>
  )
}
