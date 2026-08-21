import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans select-none">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-8 space-y-4 shadow-sm">
        <h1 className="text-4xl font-extrabold text-slate-900 font-heading">404</h1>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-800 font-heading">Page Not Found</h2>
          <p className="text-xs text-slate-500">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button
              variant="default"
              className="w-full justify-center font-bold"
              leftIcon={<Home size={16} />}
            >
              Go to Home Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
