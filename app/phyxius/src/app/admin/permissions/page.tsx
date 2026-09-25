import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permissions — Admin — MosiMosi",
};

export default function AdminPermissionsPage() {
  return (
    <div className="flex-1 pl-6 pr-6 pt-6 sm:pl-8 lg:pl-10">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          Permissions
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Define what roles can access across the app.
        </p>
      </div>

      <div className="border-t border-dashed border-zinc-300 py-12 text-center">
        <p className="text-sm font-medium text-zinc-900">Coming soon</p>
        <p className="mt-1 text-sm text-zinc-500">
          Permission rules will live here.
        </p>
      </div>
    </div>
  );
}
