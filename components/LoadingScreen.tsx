export interface LoadingScreenProps {
  progress: number;
  visible: boolean;
}

export default function LoadingScreen({ progress, visible }: LoadingScreenProps) {
  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-1.5 w-[min(50vw,220px)] overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-paco-ginger"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <span className="sr-only" role="status">
        {progress >= 100 ? "Ready" : "Loading"}
      </span>
    </div>
  );
}
