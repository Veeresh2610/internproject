import React, { useState } from "react";

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  onSelectTab: (e: number) => void;
  activeTab: number;
  disabled?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ items, onSelectTab, activeTab = 0, disabled }) => {
  const [activeIndex, setActiveIndex] = useState(activeTab);

  return (
    <div className='mb-4 border-0 border-gray-200 dark:border-gray-700'>
      <ul
        className='flex flex-wrap -mb-px text-sm font-medium text-center border-b border-gray-200 dark:border-gray-700'
        role='tablist'
      >
        {items.map((item, index) => (
          <li key={index} className='me-2' role='presentation'>
            <button
              className={`inline-block px-2 py-1 border-b-2 rounded-t-lg ${
                index !== 0 && disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : activeIndex === index
                  ? "pannel-bg-1 text-color-1 border-b border-[#437880]"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              type='button'
              role='tab'
              aria-selected={activeIndex === index}
              onClick={() => {
                if (!disabled) {
                  setActiveIndex(index);
                  onSelectTab(index);
                }
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div className='px-0 py-3 rounded-lg '>{items[activeIndex].content}</div>
    </div>
  );
};

export default Tabs;
