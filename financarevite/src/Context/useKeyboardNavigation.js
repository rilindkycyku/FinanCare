// useKeyboardNavigation.js

import { useEffect, useState } from 'react';

export default function useKeyboardNavigation(listItems) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    function handleKeyDown(e) {
      if (listItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        setSelectedIndex((prevIndex) => (prevIndex + 1) % listItems.length);
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prevIndex) =>
          (prevIndex - 1 + listItems.length) % listItems.length
        );
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    
  }, [listItems]);

  return selectedIndex;
}
