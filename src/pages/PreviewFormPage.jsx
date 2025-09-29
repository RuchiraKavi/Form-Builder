import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function PreviewFormPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Validate required fields
      const missingRequired = form.fields
        .filter(field => field.required)
        .find(field => !formData[field.id] || 
          (Array.isArray(formData[field.id]) && formData[field.id].length === 0));

      if (missingRequired) {
        alert('Please fill in all required fields');
        return;
      }

      // Process form data before submission
      const processedFormData = {};
      form.fields.forEach(field => {
        processedFormData[field.id] = formData[field.id] || 
          (field.type === 'checkbox' ? [] : '');
      });

      const response = await fetch(`http://localhost:8000/api/forms/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ responses: processedFormData }),
      });

      let responseData;
      const contentType = response.headers.get("content-type");
      try {
        if (contentType && contentType.indexOf("application/json") !== -1) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server error: The API is not responding correctly. Please check if the Laravel server is running.');
        }

        if (!response.ok) {
          throw new Error(responseData.message || responseData.error || 'Failed to submit form');
        }

        // If we got here, the submission was successful
        responseData = responseData || {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Error processing server response: ' + parseError.message);
      }

      alert('Form submitted successfully!');
      
      // Navigate to submissions page after successful submission
      navigate('/submissions');
    } catch (error) {
      alert('Error submitting form: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchForm = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/forms/${id}`);
      if (!response.ok) throw new Error('Failed to fetch form');
      const data = await response.json();
      setForm(data);
      
      // Initialize form data with empty values
      const initialData = {};
      data.fields.forEach(field => {
        initialData[field.id] = field.type === 'checkbox' ? [] : '';
      });
      setFormData(initialData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCheckboxChange = (fieldId, value) => {
    setFormData(prev => {
      const currentValues = prev[fieldId] || [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [fieldId]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [fieldId]: [...currentValues, value]
        };
      }
    });
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="form-input"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="form-textarea"
          />
        );

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {field.options.map((option, i) => (
              <label key={i} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData[field.id] || []).includes(option)}
                  onChange={() => handleCheckboxChange(field.id, option)}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options.map((option, i) => (
              <label key={i} className="radio-label">
                <input
                  type="radio"
                  name={`field_${field.id}`}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!form) return <div>Form not found</div>;

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <header className="page-header">
          <div>
            <h1>{form.title}</h1>
            <p className="subtitle">Preview Mode</p>
          </div>
          <div>
            <button onClick={() => navigate('/forms')} className="button">
              Back to Forms
            </button>
          </div>
        </header>

        <div className="form-preview">
          <form onSubmit={handleSubmit} className="preview-form">
            {form.fields.sort((a, b) => a.order - b.order).map((field) => (
              <div key={field.id} className="form-field">
                <label>
                  {field.label}
                  {field.required && <span className="required">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
            <div className="form-actions mt-4">
              <button type="submit" className="button primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}