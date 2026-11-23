'use client';

import { useState, useEffect, useRef } from 'react';

export default function ImageUploadField({
  label = 'Upload Image',
  value = '',
  onChange,
  name,
  required = false,
  helperText,
}) {
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(value || '');
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success' | 'error', msg: string }
  const fileInputRef = useRef(null);

  // Keep in sync with parent value (e.g. when opening edit modal for different items)
  useEffect(() => {
    setCurrentUrl(value || '');
  }, [value]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadStatus(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        setCurrentUrl(data.url);
        if (onChange) onChange(data.url);
        setUploadStatus({
          type: 'success',
          msg: data.provider === 'cloudinary' ? '✓ Uploaded to Cloudinary cloud' : '✓ Photo uploaded successfully',
        });
        setTimeout(() => setUploadStatus(null), 4000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadStatus({ type: 'error', msg: '✕ Upload failed: ' + err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualChange = (e) => {
    const val = e.target.value;
    setCurrentUrl(val);
    if (onChange) onChange(val);
  };

  const handleClear = () => {
    setCurrentUrl('');
    if (onChange) onChange('');
    setUploadStatus(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        {currentUrl && (
          <button
            type="button"
            onClick={handleClear}
            style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* Main Upload Box with Live Thumbnail */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px 14px',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {/* Preview thumbnail */}
        {currentUrl ? (
          <div
            style={{
              position: 'relative',
              width: '64px',
              height: '64px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #e2e8f0',
              background: '#0f172a',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = '/assets/graphics/brand-fallback.svg';
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: '#94a3b8',
              flexShrink: 0,
            }}
          >
            📷
          </div>
        )}

        {/* Upload Button + Device selection */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: uploading ? '#94a3b8' : '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(15,23,42,0.12)',
              }}
            >
              {uploading ? '⏳ Uploading...' : '📁 Choose Image from Device'}
            </button>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {uploading ? 'Connecting...' : '(JPG, PNG, WebP)'}
            </span>
          </div>

          {uploadStatus && (
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: uploadStatus.type === 'success' ? '#16a34a' : '#ef4444' }}>
              {uploadStatus.msg}
            </div>
          )}

          {helperText && !uploadStatus && (
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{helperText}</div>
          )}
        </div>
      </div>

      {/* Visible Image URL Field (Always accessible so user sees exact current image link) */}
      <div>
        <input
          type="text"
          name={name}
          value={currentUrl}
          required={required}
          onChange={handleManualChange}
          placeholder="Image URL (auto-filled on upload, or paste external link)"
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.8rem',
            background: '#ffffff',
            color: '#1e293b',
          }}
        />
      </div>
    </div>
  );
}
