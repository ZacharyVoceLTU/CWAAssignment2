"use client";

import { useState, useEffect } from "react";
import styles from "@/components/Tabs/tabs.module.css";

type Tab = {
  id: number;
  title: string;
  content: string;
};

export default function Tabs() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 1, title: "Tab 1", content: "This is tab 1 content" },
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [editingTabId, setEditingTabId] = useState<number | null>(null);
  const [outputHTML, setOutputHTML] = useState<string>("");

  // Load tabs when mounting
  useEffect(() => {
    const savedTabs = localStorage.getItem("tabs");
    if (savedTabs) {
      const parsedTabs: Tab[] = JSON.parse(savedTabs);
      setTabs(parsedTabs);
      if (parsedTabs.length) setActiveTab(parsedTabs[0].id);
    } else {
      // default first tab if nothing in storage
      setTabs([{ id: 1, title: "Tab 1", content: "This is tab 1 content" }]);
      setActiveTab(1);
    }
  }, []);

  // Save tabs when changed
  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  // Updates html output window when a change is made
  useEffect(() => {
    const html = generateHTML(tabs);
    setOutputHTML(html);
  }, [tabs]);

  // Add a new tab (up to 15)
  const addTab = () => {
    if (tabs.length >= 15) return; // limit 15
    const newId = tabs.length ? Math.max(...tabs.map((t) => t.id)) + 1 : 1;
    const newTab = {
      id: newId,
      title: `Tab ${newId}`,
      content: "New tab content",
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
  };

  // Function that builds the full standalone HTML
  const generateHTML = (tabs: Tab[]): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    .tabs { display: flex; gap: 10px; }
    .tab { padding: 8px 12px; border: 1px solid #ccc; cursor: pointer; }
    .active { background: #eee; }
    .tab-content { margin-top: 10px; border: 1px solid #ccc; padding: 10px; }
  </style>
</head>
<body>
  <div class="tabs">
    ${tabs
      .map(
        (tab, i) =>
          `<div class="tab ${
            i === 0 ? "active" : ""
          }" onclick="showTab(${i})">${tab.title}</div>`
      )
      .join("")}
  </div>
  <div id="tab-content" class="tab-content">${tabs[0]?.content || ""}</div>
  
  <script>
    const tabs = ${JSON.stringify(tabs)};
    function showTab(index) {
      document.querySelectorAll('.tab').forEach((el, i) => {
        el.classList.toggle('active', i === index);
      });
      document.getElementById('tab-content').innerText = tabs[index].content;
    }
  </script>
</body>
</html>
  `;
  };

  // Delete a tab
  const deleteTab = (id: number) => {
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    if (newTabs.length) {
      setActiveTab(newTabs[0].id); // switch to first remaining tab
    }
  };

  const updateTabTitle = (id: number, newTitle: string) => {
    setTabs(tabs.map((t) => (t.id === id ? { ...t, title: newTitle } : t)));
  };

  // Update tab content
  const updateContent = (id: number, newContent: string) => {
    setTabs(tabs.map((t) => (t.id === id ? { ...t, content: newContent } : t)));
  };

  return (
    <div className={styles.tabsContainer}>
      {/* Tab buttons */}
      <div className={styles.tabButtons}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.tab} ${
              tab.id === activeTab ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* BUG: Currently saves two versions of tab titles when changing tabs.
                    Think it shows the input value and tab title value */}
            {editingTabId === tab.id ? (
              <input
                type="text"
                value={tab.title}
                autoFocus
                onBlur={() => setEditingTabId(null)}
                onChange={(e) => updateTabTitle(tab.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setEditingTabId(null);
                }}
                className={styles.tabInput}
              />
            ) : (
              <span onDoubleClick={() => setEditingTabId(tab.id)}>
                {tab.title}
              </span>
            )}
            {tab.title}
            <button
              className={styles.deleteTabButton}
              onClick={(e) => {
                e.stopPropagation(); // prevent activating when deleting
                deleteTab(tab.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {tabs.length < 15 && (
          <button className={styles.addTabButton} onClick={addTab}>
            ＋
          </button>
        )}
      </div>

      {/* Active tab content */}
      <div className={styles.container2}>
        <div className={styles.tabContent}>
          {tabs.map(
            (tab) =>
              tab.id === activeTab && (
                <textarea
                  key={tab.id}
                  className={styles.tabTextarea}
                  value={tab.content}
                  onChange={(e) => updateContent(tab.id, e.target.value)}
                />
              )
          )}
        </div>
        <div className={styles.outputWindow}> {outputHTML} </div>
      </div>
    </div>
  );
}
