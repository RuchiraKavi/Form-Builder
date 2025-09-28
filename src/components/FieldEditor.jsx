import { useState, useEffect } from "react";

export default function FieldEditor({ field, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown }) {
  const [data, setData] = useState(field);

  useEffect(() => {
    setData(field); // update if field prop changes
  }, [field]);

  const update = (changes) => {
    const updated = { ...data, ...changes };
    setData(updated);
    onUpdate(updated);
  };

  return (
    <div className="field-card border rounded p-4 mb-3 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <div className="field-label flex items-center gap-2">
          <span className="text-sm font-medium capitalize">
            {data.type === "text" ? "Text Input"
              : data.type === "textarea" ? "Text Area"
              : data.type === "checkbox" ? "Checkbox"
              : "Radio Button"}
          </span>
          <span className="field-badge text-xs px-1 bg-gray-200 rounded">{data.type}</span>
        </div>

        <div className="flex gap-2">
          <button onClick={onMoveUp}>↑</button>
          <button onClick={onMoveDown}>↓</button>
          <button onClick={onDuplicate}>⧉</button>
          <button onClick={onDelete} className="text-red-500">🗑</button>
        </div>
      </div>

      {/* Label */}
      <label className="block mb-1">Label</label>
      <input
        type="text"
        value={data.label}
        onChange={(e) => update({ label: e.target.value })}
        className="input w-full mb-2"
      />

      {/* Options */}
      {(data.type === "checkbox" || data.type === "radio") && (
        <div className="mb-2">
          <label className="block mb-1">Options</label>
          {data.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 mb-1">
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const opts = [...data.options];
                  opts[i] = e.target.value;
                  update({ options: opts });
                }}
                className="input flex-1"
              />
              <button
                onClick={() => update({ options: data.options.filter((_, idx) => idx !== i) })}
                className="text-red-500"
              >
                🗑
              </button>
            </div>
          ))}
          <button
            onClick={() => update({ options: [...data.options, `Option ${data.options.length + 1}`] })}
            className="text-blue-500 text-sm"
          >
            + Add Option
          </button>
        </div>
      )}

      {/* Required toggle */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.required}
          onChange={(e) => update({ required: e.target.checked })}
        />
        Required field
      </label>
    </div>
  );
}
