import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { AIReflection } from "./AIReflection";

interface JournalPage {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JournalEditorProps {
  page: JournalPage | null;
  onUpdatePage: (pageId: string, updates: Partial<JournalPage>) => void;
}

export function JournalEditor({ page, onUpdatePage }: JournalEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setContent(page.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [page]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (page) {
      onUpdatePage(page.id, { title: newTitle, updatedAt: new Date() });
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (page) {
      onUpdatePage(page.id, { content: newContent, updatedAt: new Date() });
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  if (!page) {
    return (
      <div className="flex-1 bg-journal-content flex items-center justify-center">
        <div className="text-center max-w-md">
          <BookOpen className="h-16 w-16 text-journal-placeholder mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-medium text-journal-title mb-3">
            Welcome to your Journal
          </h2>
          <p className="text-journal-placeholder leading-relaxed">
            Select a page from the sidebar to start writing, or create a new page to begin your journey.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-journal-content flex flex-col">
      {/* Header with metadata */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4 text-sm text-journal-placeholder">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDateTime(page.createdAt)}</span>
            </div>
            {page.updatedAt.getTime() !== page.createdAt.getTime() && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Updated {formatDateTime(page.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Title */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => {
              handleTitleChange(e.target.value);
              autoResize(e.target);
            }}
            placeholder="Untitled"
            className="w-full text-4xl font-serif font-bold text-journal-title bg-transparent border-none outline-none resize-none placeholder:text-journal-placeholder leading-tight"
            style={{ minHeight: '60px' }}
            onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
          />

          {/* Content */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => {
              handleContentChange(e.target.value);
              autoResize(e.target);
            }}
            placeholder="Start writing your thoughts..."
            className="w-full text-lg text-journal-text bg-transparent border-none outline-none resize-none placeholder:text-journal-placeholder leading-relaxed font-serif mb-8"
            style={{ minHeight: '400px' }}
            onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
          />

          {/* AI Reflection Section */}
          <div className="border-t border-border pt-8">
            <AIReflection 
              journalContent={content}
              journalTitle={title || "Untitled"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}