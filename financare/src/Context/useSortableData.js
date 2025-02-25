import { useState } from "react";
import { parseISO, isValid, isWithinInterval } from 'date-fns';

const useSortableData = (items, config = null, search = '', itemsPerPage = 10, dateField = null, startDate = null, endDate = null) => {
  const [sortConfig, setSortConfig] = useState(config);
  const [currentPage, setCurrentPage] = useState(0);

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = () => {
    let sortableData = [...items];

    // Filtering by date
    if (dateField && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      sortableData = sortableData.filter(item => {
        // Parse ISO string from item[dateField]
        const itemDate = parseISO(item[dateField]);
        return isValid(itemDate) && isValid(start) && isValid(end) && isWithinInterval(itemDate, { start, end });
      });
    }

    // Sorting
    if (sortConfig !== null && sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    // Searching
    if (search) {
      const query = search.toLowerCase();
      sortableData = sortableData.filter(item =>
        Object.values(item).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(query)
        )
      );
    }

    return sortableData;
  };

  const pageCount = Math.ceil(sortedData().length / itemsPerPage);

  const sliceStart = currentPage * itemsPerPage;
  const sliceEnd = sliceStart + itemsPerPage;
  const visibleItems = sortedData().slice(sliceStart, sliceEnd);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return {
    items: visibleItems,
    requestSort: sortData,
    sortConfig,
    currentPage,
    pageCount,
    goToPage
  };
};

export default useSortableData;
