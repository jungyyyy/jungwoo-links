"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import type { Section } from "@/lib/types";

function SortableSectionRow({
  section,
  onEdit,
  onDelete,
}: {
  section: Section;
  onEdit: (section: Section) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </button>

      <span className="flex-1 font-medium text-gray-900">{section.name}</span>

      <button
        onClick={() => onEdit(section)}
        className="text-sm text-indigo-600 hover:text-indigo-700"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(section.id)}
        className="text-sm text-red-600 hover:text-red-700"
      >
        Delete
      </button>
    </div>
  );
}

export function SectionsSection() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetch("/api/admin/sections")
      .then((r) => r.json())
      .then((data) => {
        setSections(data);
        setLoading(false);
      });
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);

    setSections(reordered);

    await fetch("/api/admin/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reorder: true,
        items: reordered.map((s, i) => ({ id: s.id, order_index: i })),
      }),
    });
  }

  async function handleAdd() {
    if (!newName.trim()) return;

    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (res.ok) {
      const created = await res.json();
      setSections((prev) => [...prev, created]);
      setNewName("");
      setShowAdd(false);
    }
  }

  async function handleEditSave() {
    if (!editingId || !editName.trim()) return;

    const res = await fetch("/api/admin/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, name: editName.trim() }),
    });

    if (res.ok) {
      const updated = await res.json();
      setSections((prev) =>
        prev.map((s) => (s.id === editingId ? updated : s))
      );
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this section? Links inside will become unsectioned."))
      return;

    await fetch(`/api/admin/sections?id=${id}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) {
    return <p className="text-gray-500">Loading sections...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Sections ({sections.length})
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="admin-btn-primary"
        >
          Add section
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-2 rounded-xl border border-gray-200 bg-white p-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Section name"
            className="admin-input flex-1"
            autoFocus
          />
          <button onClick={handleAdd} className="admin-btn-primary">
            Save
          </button>
          <button
            onClick={() => {
              setShowAdd(false);
              setNewName("");
            }}
            className="admin-btn-secondary"
          >
            Cancel
          </button>
        </div>
      )}

      {editingId && (
        <div className="flex gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="admin-input flex-1"
            autoFocus
          />
          <button onClick={handleEditSave} className="admin-btn-primary">
            Save
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="admin-btn-secondary"
          >
            Cancel
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableSectionRow
                key={section.id}
                section={section}
                onEdit={(s) => {
                  setEditingId(s.id);
                  setEditName(s.name);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-8">
          No sections yet. Add one to group your links.
        </p>
      )}
    </div>
  );
}
