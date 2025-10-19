'use client'

import "./globals.css";

import {useState, useEffect} from 'react';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HamburgerMenu from "@/components/hamburgerMenu/hamburgerMenu";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  const [theme, setTheme] = useState<string>("dark");
  const [hasMounted, setHasMounted] = useState(false); // 1. Initial state for server

  useEffect(() => {
    // 2. This only runs on the client after the initial render
    setHasMounted(true); 
    // ... Load theme from localStorage here ...
  }, []);

  // 3. Define the style: Use a neutral style for the server render
  const dynamicStyle = hasMounted 
    ? { background: theme === "dark" ? "black" : theme === "light" ? "white" : "purple" }
    : { background: "transparent" };

  const changeTheme = (themeIs: string) => {
        if (themeIs === "light") setTheme("light");
        else if (themeIs === "dark") setTheme("dark");
        else if (themeIs === "purple") setTheme("purple");
  }

  return (
      <html lang="en">
        <body>
          <DndProvider backend={HTML5Backend}>
            <div style={dynamicStyle}>
            <HamburgerMenu changeTheme={changeTheme}></HamburgerMenu>
            <Header theme={theme}></Header>
            {children}
            <Footer theme={theme}></Footer>
            </div>
          </DndProvider>
        </body>
      </html>
  );
}
