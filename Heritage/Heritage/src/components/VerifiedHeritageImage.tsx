import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, ExternalLink, X } from 'lucide-react';
import type { VerifiedImage } from '../types';

interface Props {
  image?: VerifiedImage;
  className?: string;
  aspectRatio?: string;
  showCreditBadge?: boolean;
  allowZoom?: boolean;
}

export const VerifiedHeritageImage: React.FC<Props> = ({
  image,
  className = '',
  aspectRatio = 'aspect-[16/10]',
  showCreditBadge = true,
  allowZoom = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // If no image is provided, or if marked unverified, or image failed to load
  const isUnverified = !image || !image.isVerified || hasError;

  if (isUnverified) {
    return (
      <div 
        className={`relative bg-amber-950/10 border border-amber-800/20 rounded-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden ${aspectRatio} ${className}`}
        role="img"
        aria-label="Authentic photograph pending verification"
      >
        <div className="absolute inset-0 azulejo-bg opacity-30 pointer-events-none" />
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shadow-sm border border-amber-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h4 className="font-serif text-amber-900 text-sm font-semibold tracking-wide">
          Authentic photograph pending
        </h4>
        <p className="text-amber-800/80 text-xs mt-1 max-w-xs leading-relaxed">
          Awaiting verified archival attribution & Wikimedia Commons source check.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`relative group overflow-hidden rounded-2xl bg-stone-900 ${aspectRatio} ${className}`}>
        {/* Main Image */}
        <img
          src={image.url}
          alt={image.caption || 'Goa Heritage Discovery'}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            allowZoom ? 'group-hover:scale-105 cursor-pointer' : ''
          }`}
          onClick={() => allowZoom && setIsZoomed(true)}
          loading="lazy"
        />

        {/* Gradient Overlay for Caption/Badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Bottom Caption & Verification Badge Bar */}
        <div className="absolute bottom-0 inset-x-0 p-3.5 flex items-end justify-between gap-3 text-white pointer-events-none">
          <div className="flex-1 min-w-0">
            {image.caption && (
              <p className="text-xs font-medium text-stone-100 line-clamp-1 drop-shadow-sm">
                {image.caption}
              </p>
            )}
          </div>

          {showCreditBadge && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCreditModal(true);
              }}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 backdrop-blur-md text-[11px] font-semibold text-emerald-300 border border-emerald-500/40 shadow-lg transition-all hover:scale-105"
              title="Verified Media Credit Info"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Credit</span>
            </button>
          )}
        </div>
      </div>

      {/* Attribution & Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-stone-800 relative">
            <button
              onClick={() => setShowCreditModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-lg">Authentic Media Attribution</h3>
                <p className="text-xs text-stone-500">Verified Wikimedia Commons Source</p>
              </div>
            </div>

            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-0.5">
                  Caption / Title
                </span>
                <p className="font-medium text-stone-800">{image.caption || 'Heritage Monument'}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-0.5">
                  Creator / Author
                </span>
                <p className="font-medium text-stone-800">{image.author || 'Wikimedia Contributor'}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-0.5">
                  License
                </span>
                <span className="inline-block px-2.5 py-0.5 bg-azulejo-100 text-azulejo-800 rounded-md font-mono text-xs font-semibold">
                  {image.license || 'Creative Commons'}
                </span>
              </div>

              {image.sourceUrl && (
                <div className="pt-2 border-t border-stone-200">
                  <a
                    href={image.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-azulejo-600 hover:text-azulejo-800 font-medium text-xs hover:underline"
                  >
                    <span>View original on Wikimedia Commons</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-5 text-center">
              <button
                onClick={() => setShowCreditModal(false)}
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-colors"
              >
                Close Credit Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[85vh] p-2 text-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={image.url}
              alt={image.caption}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl mx-auto border border-white/10"
            />
            {image.caption && (
              <p className="mt-4 text-stone-300 text-sm font-medium font-serif">{image.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
