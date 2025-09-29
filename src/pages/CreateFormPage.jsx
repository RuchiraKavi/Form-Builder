import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FieldEditor from "../components/FieldEditor";
import Sidebar from "../components/Sidebar";

export default function CreateFormPage() {
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // --- Field Management ---
  const addField = (type) => {
    setFields([
      ...fields,
      {
        id: Date.now(),
        type,
        label: `${type === "text" ? "Text" : type} Field`,
        required: false,
        options: ["checkbox", "radio"].includes(type) ? ["Option 1", "Option 2"] : [],
      },
    ]);
  };

  const updateField = (id, updated) =>
    setFields(fields.map((f) => (f.id === id ? updated : f)));

  const deleteField = (id) => setFields(fields.filter((f) => f.id !== id));

  const duplicateField = (id) => {
    const field = fields.find((f) => f.id === id);
    if (field) setFields([...fields, { ...field, id: Date.now() }]);
  };

  const moveField = (id, direction) => {
    const idx = fields.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const newFields = [...fields];
    const [removed] = newFields.splice(idx, 1);

    if (direction === "up" && idx > 0) newFields.splice(idx - 1, 0, removed);
    else if (direction === "down" && idx < newFields.length) newFields.splice(idx + 1, 0, removed);

    setFields(newFields);
  };

  // --- Save Form ---
  const saveForm = async () => {
    if (!title.trim()) {
      setErrors({ title: "Form title is required" });
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const res = await fetch("http://localhost:8000/api/forms", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          title, 
          fields: fields.map((field, index) => ({
            ...field,
            order: index
          }))
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Handle validation errors
        if (data.errors) {
          setErrors(data.errors);
        } else {
          throw new Error(data.message || 'Failed to save form');
        }
        return;
      }
      
      // Success - navigate to forms list
      navigate('/forms');

      // Success
      alert("Form saved successfully!");
      setTitle("");
      setFields([]);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout flex">
      <Sidebar />
      <main className="content flex-1 p-6">
        <header className="page-header flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Create Form</h1>
          <div className="flex gap-2">
            <button 
              className="button" 
              disabled={saving} 
              onClick={() => navigate("/forms")}
            >
              Cancel
            </button>
            <button className="button primary" onClick={saveForm} disabled={saving}>
              {saving ? "Saving..." : "Save Form"}
            </button>
          </div>
        </header>

        {/* Form Title */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Form Title *</label>
          <input
            type="text"
            placeholder="Enter form title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`input w-full ${errors.title ? "border-red-500" : ""}`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Add Fields */}
        <div className="toolbar mb-4">
          <h2 className="font-semibold mb-2">Add Fields</h2>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => addField("text")} className="button w-full">+ Text Input</button>
            <button onClick={() => addField("textarea")} className="button w-full">+ Text Area</button>
            <button onClick={() => addField("radio")} className="button w-full">+ Radio Button</button>
            <button onClick={() => addField("checkbox")} className="button w-full">+ Check Box</button>
          </div>
        </div>

        {/* Form Fields */}
        <div>
          <h2 className="font-semibold mb-2">Form Fields</h2>
          {fields.length === 0 && <p className="text-gray-500">No fields added yet.</p>}
          {fields.map((field) => (
            <FieldEditor
              key={field.id}
              field={field}
              onUpdate={(f) => updateField(field.id, f)}
              onDelete={() => deleteField(field.id)}
              onDuplicate={() => duplicateField(field.id)}
              onMoveUp={() => moveField(field.id, "up")}
              onMoveDown={() => moveField(field.id, "down")}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
