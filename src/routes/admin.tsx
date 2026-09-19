import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminRedirect,
});

function AdminRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/llp", replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#070b13] flex items-center justify-center text-white text-sm">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <span>Redirecting to Admin Portal...</span>
      </div>
    </div>
  );
}

