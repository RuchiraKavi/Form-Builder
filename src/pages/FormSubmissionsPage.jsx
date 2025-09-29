import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function FormSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleFormClick = (formId) => {
    navigate(`/forms/${formId}`);
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/submissions');
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div>Loading submissions...</div>
      </main>
    </div>
  );

  if (error) return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div className="error">Error: {error}</div>
      </main>
    </div>
  );

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <header className="page-header">
          <div>
            <h1>Form Submissions</h1>
            <p className="subtitle">View all form submissions</p>
          </div>
          <div>
            <button 
              onClick={() => navigate('/forms')} 
              className="button"
            >
              Back to Forms
            </button>
          </div>
        </header>

        {submissions.length === 0 ? (
          <div className="empty-state">
            <p>No submissions yet</p>
          </div>
        ) : (
          <div className="submissions-list">
            {submissions.map((submission) => (
              <div 
                key={submission.id} 
                className="submission-card"
                onClick={() => handleFormClick(submission.form_id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="submission-header">
                  <h3>{submission.form.title}</h3>
                  <span className="submission-date">
                    {new Date(submission.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="submission-content">
                  {submission.form.fields.map((field) => {
                    const value = submission.responses[field.id];
                    if (value === undefined) return null;
                    
                    return (
                      <div key={field.id} className="response-item">
                        <strong>{field.label}:</strong>
                        <span>
                          {field.type === 'checkbox' || field.type === 'radio'
                            ? (Array.isArray(value) ? value.join(", ") : value)
                            : value || '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
