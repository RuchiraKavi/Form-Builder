import { useState } from "react";
import FieldEditor from "../components/FieldEditor";
import Sidebar from "../components/Sidebar";

export default function CreateFormPage() {
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState([]);

  const addField = (type) => {
    const newField = {
      id: Date.now(),
      type,
      label: `${type === "text" ? "Text" : type} Field`,
      required: false,
      options: (type === "checkbox" || type === "radio") ? ["Option 1", "Option 2"] : []
    };
    setFields([...fields, newField]);
  };

  const updateField = (id, updated) => {
    setFields(fields.map(f => f.id === id ? updated : f));
  };

  const deleteField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const duplicateField = (id) => {
    const field = fields.find(f => f.id === id);
    const copy = { ...field, id: Date.now() };
    setFields([...fields, copy]);
  };

  const moveField = (id, direction) => {
    const idx = fields.findIndex(f => f.id === id);
    if (idx < 0) return;
    const newFields = [...fields];
    const [removed] = newFields.splice(idx, 1);
    if (direction === "up" && idx > 0) {
      newFields.splice(idx - 1, 0, removed);
    } else if (direction === "down" && idx < newFields.length) {
      newFields.splice(idx + 1, 0, removed);
    }
    setFields(newFields);
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <header className="page-header flex justify-between items-center">
          <h1>Create Form</h1>
          <div>
            <button className="button">Cancel</button>
            <button className="button primary ml-2">Save Form</button>
          </div>
        </header>

        {/* Form Title */}
        <div className="mb-4">
          <label className="block font-semibold">Form Title *</label>
          <input
            type="text"
            placeholder="Enter form title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input title-input w-full"
          />
        </div>

        {/* Add Fields */}
        <div className="toolbar mb-4">
        <h2 className="font-semibold">Add Fields</h2>
        <div className="toolbar-buttons grid grid-cols-4 gap-2 mt-2">
            <button onClick={() => addField("text")} className="button w-full">+ Text Input</button>
            <button onClick={() => addField("textarea")} className="button w-full">+ Text Area</button>
            <button onClick={() => addField("radio")} className="button w-full">+ Radio Button</button>
            <button onClick={() => addField("checkbox")} className="button w-full">+ Check box</button>
        </div>
        </div>


        {/* Form Fields */}
        <div>
          <h2 className="font-semibold mb-2">Form Fields</h2>
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
