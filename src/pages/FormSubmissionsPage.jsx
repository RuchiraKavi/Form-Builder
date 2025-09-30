import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

export default function FormSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/submissions");
      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }
      const data = await response.json();
      setSubmissions(data);
      if (data.length > 0) {
        setSelectedSubmission(data[0]); // auto-select first
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Backend should provide /api/submissions/export for CSV
    window.location.href = "http://127.0.0.1:8000/api/submissions/export";
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="content">
          <div>Loading submissions...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="content">
          <div className="error">Error: {error}</div>
        </main>
      </div>
    );
  }

  const filteredSubmissions = submissions.filter((s) =>
    JSON.stringify(s).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <header className="page-header">
          <div>
            <h1>Form Submissions</h1>
            <p className="subtitle">
              {selectedSubmission?.form?.title || "Contact Form"} •{" "}
              {submissions.length} submissions
            </p>
          </div>
          <div>
            <button onClick={handleExportCSV} className="button primary">
              Export CSV
            </button>
          </div>
        </header>

        <div className="submissions-container">
          {/* Left Panel */}
          <div className="submissions-list">
            <div className="submissions-controls">
              <input
                type="text"
                placeholder="Search submissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="empty-state">No submissions found</div>
            ) : (
              filteredSubmissions.map((submission, idx) => (
                <div
                  key={submission.id}
                  className={`submission-item ${
                    selectedSubmission?.id === submission.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <h4>Submission #{idx + 1}</h4>
                  {submission.form.fields
                    ?.slice(0, 2)
                    .map((field) => {
                      const value = submission.responses?.[field.id];
                      if (!value) return null;
                      return (
                        <p key={field.id}>
                          <strong>{field.label}:</strong> {value}
                        </p>
                      );
                    })}
                  {(submission.form.fields?.length || 0) > 2 && (
                    <p className="more-fields">
                      +{(submission.form.fields?.length || 0) - 2} more fields
                    </p>
                  )}
                  <span className="submission-date">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Right Panel */}
          <div className="submission-details">
            {selectedSubmission ? (
              <>
                <div className="submission-meta">
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>IP Address:</strong>{" "}
                    {selectedSubmission.ip_address || "N/A"}
                  </p>
                </div>

                <h3>Form Data</h3>
                <div className="submission-fields">
                  {selectedSubmission.form.fields?.map((field) => {
                    const value = selectedSubmission.responses?.[field.id];
                    return (
                      <div key={field.id} className="submission-field">
                        <label>{field.label}</label>
                        <div className="field-value">
                          {value || (
                            <span className="no-response">No response</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="empty-state">
                Select a submission to view details
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
