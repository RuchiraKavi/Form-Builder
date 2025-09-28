import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function FormsPage() {
  const [forms, setForms] = useState([
    { id: 1, title: "Contact Form", submissions: 24 },
    { id: 2, title: "Event Registration", submissions: 156 },
    { id: 3, title: "Product Feedback", submissions: 8 }
  ]);

  const handleDelete = (id) => {
    setForms(forms.filter(f => f.id !== id));
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <header className="page-header">
          <div>
            <h1>Forms</h1>
            <p className="subtitle">Manage your forms and view submissions</p>
          </div>
          <Link to="/forms/create" className="button primary">+ Create Form</Link>
        </header>

        <div className="form-grid">
          {forms.map(form => (
            <div className="form-card">
            <h2>{form.title}</h2>

            <div className="actions">
              <Link to={`/forms/${form.id}/edit`} className="button primary">Edit</Link>

              <button className="button preview">
                👁 Preview
              </button>

              <span className="badge">{form.submissions}</span>

              <button onClick={() => handleDelete(form.id)} className="button danger">
                🗑
              </button>
            </div>
          </div>    
          ))}
        </div>
      </main>
    </div>
  );
}
