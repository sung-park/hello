'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const ASPECT = 16 / 9
const OUTPUT_WIDTH = 1280
const OUTPUT_HEIGHT = 720

interface Crop {
  x: number
  y: number
  w: number
  h: number
}

function calcInitialCrop(nw: number, nh: number): Crop {
  if (nw / nh >= ASPECT) {
    const w = Math.round(nh * ASPECT)
    return { x: Math.round((nw - w) / 2), y: 0, w, h: nh }
  } else {
    const h = Math.round(nw / ASPECT)
    return { x: 0, y: Math.round((nh - h) / 2), w: nw, h }
  }
}

export function ThumbnailUploader({
  currentUrl,
  onUpload,
}: {
  currentUrl?: string
  onUpload: (url: string) => void
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [crop, setCrop] = useState<Crop | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const imgRef = useRef<HTMLImageElement>(null)
  const dragState = useRef<{ startX: number; startY: number; cropX: number; cropY: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith('image/'),
      )
      if (!item) return
      const file = item.getAsFile()
      if (file) loadImage(file)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [blobUrl])

  function loadImage(file: File) {
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
      setCrop(calcInitialCrop(img.naturalWidth, img.naturalHeight))
      setBlobUrl(url)
      setImgLoaded(false)
      setError('')
    }
    img.src = url
  }

  function getScale() {
    if (!imgRef.current || !naturalSize) return { sx: 1, sy: 1 }
    return {
      sx: imgRef.current.clientWidth / naturalSize.w,
      sy: imgRef.current.clientHeight / naturalSize.h,
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (!crop) return
    e.preventDefault()
    dragState.current = { startX: e.clientX, startY: e.clientY, cropX: crop.x, cropY: crop.y }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragState.current || !crop || !naturalSize) return
    const { sx, sy } = getScale()
    const dx = (e.clientX - dragState.current.startX) / sx
    const dy = (e.clientY - dragState.current.startY) / sy
    setCrop((c) =>
      c
        ? {
            ...c,
            x: Math.max(0, Math.min(naturalSize.w - c.w, dragState.current!.cropX + dx)),
            y: Math.max(0, Math.min(naturalSize.h - c.h, dragState.current!.cropY + dy)),
          }
        : c,
    )
  }

  function handleMouseUp() {
    dragState.current = null
  }

  async function handleUpload() {
    if (!imgRef.current || !crop) return
    setUploading(true)
    setError('')

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_WIDTH
    canvas.height = OUTPUT_HEIGHT
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(imgRef.current, crop.x, crop.y, crop.w, crop.h, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT)

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/webp', 0.85),
    )

    const fd = new FormData()
    fd.append('file', blob, 'thumbnail.webp')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      onUpload(url)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      setBlobUrl(null)
      setCrop(null)
      setNaturalSize(null)
    } catch {
      setError('업로드에 실패했습니다')
    } finally {
      setUploading(false)
    }
  }

  function handleCancel() {
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    setBlobUrl(null)
    setCrop(null)
    setNaturalSize(null)
    setImgLoaded(false)
  }

  if (blobUrl) {
    const { sx, sy } = imgLoaded ? getScale() : { sx: 0, sy: 0 }
    const displayCrop = crop && imgLoaded
      ? { left: crop.x * sx, top: crop.y * sy, width: crop.w * sx, height: crop.h * sy }
      : null

    return (
      <div className="space-y-3">
        <div
          className="relative inline-block overflow-hidden rounded border border-slate-700 select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imgRef}
            src={blobUrl}
            alt="crop preview"
            className="block max-h-[400px] max-w-full"
            draggable={false}
            onLoad={() => setImgLoaded(true)}
          />
          {displayCrop && (
            <div
              className="absolute cursor-move border-2 border-white"
              style={{
                left: displayCrop.left,
                top: displayCrop.top,
                width: displayCrop.width,
                height: displayCrop.height,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              }}
              onMouseDown={handleMouseDown}
            />
          )}
        </div>
        <p className="text-xs text-slate-500">드래그로 위치 조정 · 16:9 크롭 → 1280×720 WebP</p>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={uploading || !imgLoaded} size="sm">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                업로드 중...
              </>
            ) : (
              '크롭 & 업로드'
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={uploading}>
            취소
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {currentUrl && (
        <div className="w-48">
          <img
            src={currentUrl}
            alt="현재 썸네일"
            className="aspect-video w-full rounded border border-slate-700 object-cover"
          />
          <p className="mt-1 text-xs text-slate-500">현재 썸네일</p>
        </div>
      )}
      <div
        className="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-slate-700 p-8 text-center transition-colors hover:border-slate-500"
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-sm text-slate-400">
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-xs font-mono">Ctrl+V</kbd>
          {' '}로 붙여넣기
        </p>
        <p className="mt-1 text-xs text-slate-600">또는 클릭해서 파일 선택</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) loadImage(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
