import { useEffect, useRef } from 'react';


function useOutsideClick(isOpened:boolean, close:any) {
  const ref:any = useRef(null);

  const handleClick = (e:any) => {
    if (!ref.current.contains(e.target)) {
      close();
    }
  };

  useEffect(():any => {
    if (isOpened) {
      document.addEventListener('click', handleClick);
      return () => {
        document.removeEventListener('click', handleClick);
      };
    }
  }, [isOpened]);

  return [ref];
}

export { useOutsideClick };