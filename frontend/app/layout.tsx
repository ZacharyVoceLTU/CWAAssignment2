'use client'

import "./globals.css";

import {useState} from 'react';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HamburgerMenu from "@/components/hamburgerMenu/hamburgerMenu";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  const [theme, setTheme] = useState<string>("dark");

  const changeTheme = (themeIs: string) => {
        if (themeIs === "light") setTheme("light");
        else if (themeIs === "dark") setTheme("dark");
        else if (themeIs === "purple") setTheme("purple");
  }

  return (
      <html lang="en">
        <body>
          <DndProvider backend={HTML5Backend}>
            <div style={theme === "dark" ? {background: "black"} : theme === "light" ? {background: "white"} : {background: "purple"}}>
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
