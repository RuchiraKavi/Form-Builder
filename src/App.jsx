import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import FormsPage from "./pages/FormsPage";
import CreateFormPage from "./pages/CreateFormPage";
import "./styles.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/forms" />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/create-forms" element={<CreateFormPage />} />
      </Routes>
    </Router>
  );
}
