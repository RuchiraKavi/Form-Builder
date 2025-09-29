import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/forms');
      if (!response.ok) {
        throw new Error('Failed to fetch forms');
      }
      const data = await response.json();
      setForms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/forms/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete form');
      }
      
      // Refresh the forms list
      await fetchForms();
    } catch (err) {
      setError(err.message);
    }
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

        {loading ? (
          <div className="loading">Loading forms...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : forms.length === 0 ? (
          <div className="empty-state">
            <p>No forms created yet.</p>
            <Link to="/forms/create" className="button primary">Create your first form</Link>
          </div>
        ) : (
          <div className="form-grid">
            {forms.map(form => (
              <div key={form.id} className="form-card">
                <h2>{form.title}</h2>
                <p className="field-count">{form.fields?.length || 0} fields</p>
                <div className="actions">
                  <Link to={`/forms/${form.id}/edit`} className="button primary">Edit</Link>
                  <Link to={`/forms/${form.id}/preview`} className="button preview">
                    👁 Preview
                  </Link>
                  <button onClick={() => handleDelete(form.id)} className="button danger">
                    🗑
                  </button>
                </div>
              </div>    
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
