import { Routes, Route, Navigate } from "react-router-dom";
import { LeadsPage } from "@/pages/LeadsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/leads" replace />} />
      <Route path="/leads" element={<LeadsPage />} />
      <Route path="/leads/new" element={<LeadsPage />} />
      <Route path="/leads/:id/edit" element={<LeadsPage />} />
    </Routes>
  );
}

export default App;