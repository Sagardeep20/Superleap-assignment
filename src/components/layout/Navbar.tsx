import { useNavigate, useLocation } from "react-router-dom";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddLead = () => {
    if (location.pathname.includes("/board")) {
      navigate("/board?create=true");
    } else {
      navigate("/leads/new");
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Superleap CRM</h1>
          <nav className="flex items-center gap-2">
            <Button
              variant={location.pathname.startsWith("/leads") && !location.pathname.includes("/board") ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/leads")}
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </Button>
            <Button
              variant={location.pathname.includes("/board") ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/board")}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Board View
            </Button>
          </nav>
        </div>
        <Button onClick={handleAddLead}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>
    </header>
  );
}