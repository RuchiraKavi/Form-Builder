import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FieldEditor from "../components/FieldEditor";
import Sidebar from "../components/Sidebar";

export default function EditFormPage() {
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ useCallback ensures fetchForm is stable (no ESLint warning)
  const fetchForm = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/forms/${id}`);
      if (!response.ok) throw new Error("Failed to fetch form");
      const data = await response.json();

      console.log("Fetched form data:", data); // Debug log

      setTitle(data.title);
      setFields(
        data.fields.map((field) => ({
          ...field,
          id: field.id.toString(),
          options: Array.isArray(field.options) ? field.options : [],
        }))
      );
    } catch (err) {
      console.error("Error fetching form:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  // --- Field Management ---
  const addField = (type) => {
    setFields([
      ...fields,
      {
        id: Date.now().toString(),
        type,
        label: `${type === "text" ? "Text" : type} Field`,
        required: false,
        options: ["checkbox", "radio"].includes(type)
          ? ["Option 1", "Option 2"]
          : [],
      },
    ].map((field) => ({
      ...field,
      options: ["checkbox", "radio"].includes(field.type)
        ? Array.isArray(field.options)
          ? field.options
          : []
        : [],
    })));
  };

  const updateField = (id, updated) =>
    setFields(
      fields.map((f) => {
        if (f.id === id) {
          const field = { ...updated, id };
          // Ensure options is always an array
          if (["checkbox", "radio"].includes(field.type)) {
            field.options = Array.isArray(field.options) ? field.options : [];
          } else {
            field.options = [];
          }
          return field;
        }
        return f;
      })
    );

  const deleteField = (id) => setFields(fields.filter((f) => f.id !== id));

  const duplicateField = (id) => {
    const field = fields.find((f) => f.id === id);
    if (field)
      setFields([...fields, { ...field, id: Date.now().toString() }]);
  };

  const moveField = (id, direction) => {
    const idx = fields.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const newFields = [...fields];
    const [removed] = newFields.splice(idx, 1);

    if (direction === "up" && idx > 0) newFields.splice(idx - 1, 0, removed);
    else if (direction === "down" && idx < newFields.length)
      newFields.splice(idx + 1, 0, removed);

    setFields(newFields);
  };

  // --- Save Form ---
  const validateForm = () => {
    if (!title.trim()) {
      throw new Error("Form title is required");
    }

    fields.forEach((field, index) => {
      if (!field.label.trim()) {
        throw new Error(`Field ${index + 1} requires a label`);
      }
      if (
        ["checkbox", "radio"].includes(field.type) &&
        (!field.options || field.options.length === 0)
      ) {
        throw new Error(
          `${
            field.type === "checkbox" ? "Checkbox" : "Radio"
          } field "${field.label}" requires at least one option`
        );
      }
    });
  };

  const saveForm = async () => {
    setSaving(true);
    setError(null);

    try {
      validateForm();

      const formattedFields = fields.map((field, index) => {
        const formatted = {
          type: field.type,
          label: field.label,
          required: field.required || false,
          order: index,
        };

        if (["checkbox", "radio"].includes(field.type)) {
          formatted.options = Array.isArray(field.options)
            ? field.options
            : [];
        } else {
          formatted.options = [];
        }

        return formatted;
      });

      console.log("Sending fields:", formattedFields); // Debug log

      const response = await fetch(`http://localhost:8000/api/forms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title,
          fields: formattedFields,
        }),
      });

      const data = await response.json();
      console.log("Server response:", data); // Debug log

      if (!response.ok) {
        if (response.status === 422) {
          const errors = Object.values(data.errors || {}).flat();
          throw new Error(errors.join("\n"));
        }
        throw new Error(data.message || "Failed to update form");
      }

      // ✅ Always refresh with server response
      if (data.form) {
        const updatedFields = data.form.fields.map((field) => ({
          ...field,
          id: field.id.toString(),
          options: Array.isArray(field.options) ? field.options : [],
        }));

        setTitle(data.form.title);
        setFields(updatedFields);
      }

      alert("Form updated successfully!");
      navigate("/forms");
    } catch (err) {
      setError(err.message);
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <header className="page-header">
          <div>
            <h1>Edit Form</h1>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Form Title"
              className="title-input"
            />
          </div>
          <div>
            <button
              onClick={() => navigate("/forms")}
              className="button"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={saveForm}
              className="button primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </header>

        <div className="form-builder">
          <div className="fields-panel">
            <h2>Form Fields</h2>
            <div className="field-types">
              <button onClick={() => addField("text")}>+ Text Field</button>
              <button onClick={() => addField("textarea")}>+ Text Area</button>
              <button onClick={() => addField("checkbox")}>
                + Checkbox Group
              </button>
              <button onClick={() => addField("radio")}>+ Radio Group</button>
            </div>

            {fields.map((field) => (
              <FieldEditor
                key={field.id}
                field={field}
                onUpdate={updateField}
                onDelete={deleteField}
                onDuplicate={duplicateField}
                onMove={moveField}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
