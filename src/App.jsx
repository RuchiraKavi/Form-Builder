import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import FormsPage from "./pages/FormsPage";
import CreateFormPage from "./pages/CreateFormPage";
import EditFormPage from "./pages/EditFormPage";
import PreviewFormPage from "./pages/PreviewFormPage";
import FormSubmissionsPage from "./pages/FormSubmissionsPage";
import "./styles.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/forms" />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/forms/create" element={<CreateFormPage />} />
        <Route path="/forms/:id/edit" element={<EditFormPage />} />
        <Route path="/forms/:id/preview" element={<PreviewFormPage />} />
        <Route path="/submissions" element={<FormSubmissionsPage />} />
      </Routes>
    </Router>
  );
}
