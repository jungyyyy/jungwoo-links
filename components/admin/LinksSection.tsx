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
import type { Link, Section } from "@/lib/types";

type LinkFormData = {
  emoji: string;
  title: string;
  url: string;
  description: string;
  section_id: string;
  is_active: boolean;
};

const emptyForm: LinkFormData = {
  emoji: "🔗",
  title: "",
  url: "",
  description: "",
  section_id: "",
  is_active: true,
};

function SortableLinkRow({
  link,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 ${
        !link.is_active ? "opacity-50" : ""
      }`}
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

      <span className="text-xl">{link.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{link.title}</p>
        <p className="truncate text-xs text-gray-500">{link.url}</p>
      </div>

      <label className="flex items-center gap-1.5 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={link.is_active}
          onChange={(e) => onToggleActive(link.id, e.target.checked)}
          className="rounded border-gray-300"
        />
        Active
      </label>

      <button
        onClick={() => onEdit(link)}
        className="text-sm text-indigo-600 hover:text-indigo-700"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(link.id)}
        className="text-sm text-red-600 hover:text-red-700"
      >
        Delete
      </button>
    </div>
  );
}

export function LinksSection() {
  const [links, setLinks] = useState<Link[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LinkFormData>(emptyForm);
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function loadData() {
    const [linksRes, sectionsRes] = await Promise.all([
      fetch("/api/admin/links"),
      fetch("/api/admin/sections"),
    ]);
    setLinks(await linksRes.json());
    setSections(await sectionsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);

    setLinks(reordered);

    await fetch("/api/admin/links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reorder: true,
        items: reordered.map((l, i) => ({ id: l.id, order_index: i })),
      }),
    });
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(link: Link) {
    setEditingId(link.id);
    setForm({
      emoji: link.emoji,
      title: link.title,
      url: link.url,
      description: link.description || "",
      section_id: link.section_id || "",
      is_active: link.is_active,
    });
    setError("");
    setShowForm(true);
  }

  async function handleSaveForm() {
    if (!form.title || !form.url) {
      setError("Title and URL are required");
      return;
    }
    if (!form.url.startsWith("http")) {
      setError("URL must start with http");
      return;
    }

    const payload = {
      ...form,
      section_id: form.section_id || null,
      description: form.description || null,
    };

    if (editingId) {
      const res = await fetch("/api/admin/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLinks((prev) => prev.map((l) => (l.id === editingId ? updated : l)));
        setShowForm(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } else {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setLinks((prev) => [...prev, created]);
        setShowForm(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create");
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this link?")) return;
    await fetch(`/api/admin/links?id=${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleToggleActive(id: string, active: boolean) {
    await fetch("/api/admin/links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: active }),
    });
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, is_active: active } : l))
    );
  }

  if (loading) {
    return <p className="text-gray-500">Loading links...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Links ({links.length})
        </h2>
        <button onClick={openAddForm} className="admin-btn-primary">
          Add new link
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="font-medium text-gray-900">
            {editingId ? "Edit link" : "New link"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Emoji
              </label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                className="admin-input"
                placeholder="🔗"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Section
              </label>
              <select
                value={form.section_id}
                onChange={(e) =>
                  setForm({ ...form, section_id: e.target.value })
                }
                className="admin-input"
              >
                <option value="">No section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              URL *
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="admin-input"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="admin-input"
              placeholder="Optional one-line description"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            Active
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button onClick={handleSaveForm} className="admin-btn-primary">
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="admin-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={links.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {links.map((link) => (
              <SortableLinkRow
                key={link.id}
                link={link}
                onEdit={openEditForm}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {links.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-8">
          No links yet. Add your first link above.
        </p>
      )}
    </div>
  );
}
