'use client'

import "./globals.css";

import {useState} from 'react';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HamburgerMenu from "@/components/hamburgerMenu/hamburgerMenu";

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
        <div style={theme === "dark" ? {background: "black"} : theme === "light" ? {background: "white"} : {background: "purple"}}>
        <HamburgerMenu changeTheme={changeTheme}></HamburgerMenu>
        <Header theme={theme}></Header>
        {children}
        <Footer theme={theme}></Footer>
        </div>
      </body>
    </html>
  );
}
