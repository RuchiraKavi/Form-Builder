import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function FormSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmissionClick = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubmission(null);
  };


  const fetchSubmissions = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/submissions');
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
            {submissions.filter(submission => submission?.form?.fields).map((submission) => (
              <div
                key={submission.id}
                className="submission-card"
                style={{ cursor: 'pointer' }}
              >
                <div className="submission-header">
                  <h3>{submission.form.title}</h3>
                  <span className="submission-date">
                    {new Date(submission.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="submission-content">
                  {submission.form.fields
                    ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                    .slice(0, 2)
                    .map((field) => {
                      const value = submission.responses?.[field.id];
                      if (value === undefined || value === null || value === '') return null;

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
                  {(submission.form.fields?.length || 0) > 2 && (
                    <div className="more-fields">
                      +{(submission.form.fields?.length || 0) - 2} more fields
                    </div>
                  )}
                </div>
                <div className="submission-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmissionClick(submission);
                    }}
                    className="button primary"
                  >
                    View Submission
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for full submission details */}
        {showModal && selectedSubmission && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Form Submission Details</h2>
                <button onClick={closeModal} className="close-button">×</button>
              </div>

              <div className="modal-body">
                <div className="submission-meta">
                  <h3>{selectedSubmission.form.title}</h3>
                  <p className="submitted-at">
                    Submitted on: {new Date(selectedSubmission.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="submission-details">
                  <h4>Submitted Responses:</h4>
                  {selectedSubmission.form.fields
                    ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((field) => {
                      const value = selectedSubmission.responses?.[field.id];

                      return (
                        <div key={field.id} className="response-detail">
                          <label className="field-label">
                            {field.label}
                            {field.required && <span className="required">*</span>}
                          </label>
                          <div className="response-value">
                            {value !== undefined && value !== null && value !== '' ? (
                              field.type === 'checkbox' ? (
                                Array.isArray(value) ? (
                                  <ul className="checkbox-values">
                                    {value.map((item, index) => (
                                      <li key={index}>✓ {item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span>✓ {value}</span>
                                )
                              ) : field.type === 'radio' ? (
                                <span className="radio-value">● {value}</span>
                              ) : field.type === 'textarea' ? (
                                <div className="textarea-value">{value}</div>
                              ) : (
                                <span>{value}</span>
                              )
                            ) : (
                              <span className="no-response">No response</span>
                            )}
                          </div>
                        </div>
                      );
                    }) || []}
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={closeModal} className="button primary">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
