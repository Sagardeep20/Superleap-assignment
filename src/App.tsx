import { Routes, Route, Navigate } from "react-router-dom";
import { LeadsPage } from "@/pages/LeadsPage";
import { BoardPage } from "@/pages/BoardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/leads" replace />} />
      <Route path="/leads" element={<LeadsPage />} />
      <Route path="/leads/new" element={<LeadsPage />} />
      <Route path="/leads/:id/edit" element={<LeadsPage />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="/board/new" element={<BoardPage />} />
      <Route path="/board/:id/edit" element={<BoardPage />} />
    </Routes>
  );
}

export default App;