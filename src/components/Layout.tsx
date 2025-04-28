
import React, { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
}

export function Layout({ children, title, showBackButton = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in">
      <header className="py-4 px-4 sm:px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <ThemeToggle />
      </header>
      <main className="flex-grow p-4 sm:p-6 container max-w-6xl">
        {children}
      </main>
      <footer className="py-4 px-4 sm:px-6 text-center text-sm text-muted-foreground border-t">
        Calculadora de Rações © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
