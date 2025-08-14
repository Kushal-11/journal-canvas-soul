import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, BookOpen, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalPage {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JournalSidebarProps {
  pages: JournalPage[];
  activePage: string | null;
  onPageSelect: (pageId: string) => void;
  onCreatePage: () => void;
}

export function JournalSidebar({ pages, activePage, onPageSelect, onCreatePage }: JournalSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="w-80 bg-journal-sidebar border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-warm">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-journal-title" />
          <h1 className="text-xl font-serif font-semibold text-journal-title">Journal</h1>
        </div>
        
        <Button 
          onClick={onCreatePage}
          className="w-full bg-gradient-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-soft"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-journal-placeholder" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border text-journal-text placeholder:text-journal-placeholder"
          />
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto">
        {filteredPages.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-journal-placeholder text-sm">
              {searchQuery ? 'No pages found' : 'Start writing your first journal entry'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredPages.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageSelect(page.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg mb-2 transition-all group",
                  "hover:bg-journal-sidebar-hover hover:shadow-soft",
                  activePage === page.id
                    ? "bg-journal-sidebar-hover shadow-soft ring-1 ring-primary/20"
                    : ""
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={cn(
                    "font-medium text-sm leading-tight line-clamp-2",
                    activePage === page.id ? "text-journal-title" : "text-journal-text"
                  )}>
                    {page.title || "Untitled"}
                  </h3>
                  <span className="text-xs text-journal-placeholder ml-2 flex-shrink-0">
                    {formatDate(page.updatedAt)}
                  </span>
                </div>
                
                {page.content && (
                  <p className="text-xs text-journal-placeholder line-clamp-2 leading-relaxed">
                    {page.content.replace(/[#*_`]/g, '').substring(0, 80)}...
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}