export default function Loading({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-stone-200" />
        <div className="absolute inset-0 rounded-full border-2 border-stone-900 border-t-transparent animate-spin" />
      </div>
      {text && <p className="text-sm text-stone-400">{text}</p>}
    </div>
  );
}
