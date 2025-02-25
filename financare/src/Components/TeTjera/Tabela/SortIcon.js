import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownAZ, faArrowUpZA, faArrowsUpDown} from '@fortawesome/free-solid-svg-icons';

const SortIcon = ({ configKey, type, direction }) => {
  const getIcon = () => {
    switch (type) {
      case 'text':
        return direction === 'ascending' ? <FontAwesomeIcon icon={faArrowDownAZ} /> : <FontAwesomeIcon icon={faArrowUpZA} />;
      default:
        return <FontAwesomeIcon icon={faArrowsUpDown} />;
    }
  };

  return getIcon();
};

export default SortIcon;
