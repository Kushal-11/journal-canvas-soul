import { useState, useEffect } from "react";
import { JournalSidebar } from "./JournalSidebar";
import { JournalEditor } from "./JournalEditor";
import { useToast } from "@/hooks/use-toast";

interface JournalPage {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export function JournalApp() {
  const [pages, setPages] = useState<JournalPage[]>([]);
  const [activePage, setActivePage] = useState<string | null>(null);
  const { toast } = useToast();

  // Load pages from localStorage on mount
  useEffect(() => {
    const savedPages = localStorage.getItem('journalPages');
    if (savedPages) {
      const parsedPages = JSON.parse(savedPages).map((page: any) => ({
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt)
      }));
      setPages(parsedPages);
      
      // Set the most recent page as active
      if (parsedPages.length > 0) {
        const mostRecent = parsedPages.sort((a: JournalPage, b: JournalPage) => 
          b.updatedAt.getTime() - a.updatedAt.getTime()
        )[0];
        setActivePage(mostRecent.id);
      }
    }
  }, []);

  // Save pages to localStorage whenever pages change
  useEffect(() => {
    localStorage.setItem('journalPages', JSON.stringify(pages));
  }, [pages]);

  const createNewPage = () => {
    const newPage: JournalPage = {
      id: `page-${Date.now()}`,
      title: "",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setPages(prev => [newPage, ...prev]);
    setActivePage(newPage.id);
    
    toast({
      title: "New page created",
      description: "Start writing your thoughts..."
    });
  };

  const updatePage = (pageId: string, updates: Partial<JournalPage>) => {
    setPages(prev => prev.map(page => 
      page.id === pageId 
        ? { ...page, ...updates }
        : page
    ));
  };

  const selectPage = (pageId: string) => {
    setActivePage(pageId);
  };

  const currentPage = pages.find(page => page.id === activePage) || null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <JournalSidebar
        pages={pages}
        activePage={activePage}
        onPageSelect={selectPage}
        onCreatePage={createNewPage}
      />
      <JournalEditor
        page={currentPage}
        onUpdatePage={updatePage}
      />
    </div>
  );
}