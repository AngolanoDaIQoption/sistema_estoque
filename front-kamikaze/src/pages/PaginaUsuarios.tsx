import { Sidebar } from "../components/Sidebar";
import { GerenciarUsuarios } from "../components/GerenciarUsuarios";

export function PaginaUsuarios() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <GerenciarUsuarios />
        </div>
      </main>
    </div>
  );
}