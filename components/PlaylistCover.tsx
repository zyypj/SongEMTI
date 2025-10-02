"use client";
type Props = { thumbs: string[]; className?: string };

export default function PlaylistCover({ thumbs, className = "" }: Props) {
  const imgs = (thumbs || []).filter(Boolean).slice(0, 4);
  if (imgs.length === 0) {
    return (
      <div className={`aspect-square rounded-md bg-gradient-to-br from-emerald-700 to-emerald-400 ${className}`} />
    );
  }

  if (imgs.length === 1) {
    return (
      <div className={`aspect-square rounded-md overflow-hidden ${className}`}>
        <img src={imgs[0]} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  if (imgs.length === 2) {
    return (
      <div className={`aspect-square rounded-md overflow-hidden grid grid-cols-2 gap-px bg-black/30 ${className}`}>
        {imgs.map((src, i) => (
          <div key={i} className="bg-neutral-900">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  if (imgs.length === 3) {
    return (
      <div
        className={`aspect-square rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 gap-px bg-black/30 ${className}`}
      >
        <div className="bg-neutral-900">
          <img src={imgs[0]} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="bg-neutral-900">
          <img src={imgs[1]} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2 bg-neutral-900">
          <img src={imgs[2]} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`aspect-square rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 gap-px bg-black/30 ${className}`}
    >
      {imgs.slice(0, 4).map((src, i) => (
        <div key={i} className="bg-neutral-900">
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}
