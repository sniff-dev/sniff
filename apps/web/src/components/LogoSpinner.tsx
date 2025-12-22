export default function LogoSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full animate-spin">
          <div className="h-16 w-16 rounded-full border-2 border-transparent border-t-blue-500"></div>
        </div>

        {/* Logo in the center */}
        <div className="flex items-center justify-center h-16 w-16">
          <img src="/icon.png" alt="Sniff" className="w-10 h-10 opacity-90" />
        </div>
      </div>
    </div>
  );
}
