import { RefObject, useEffect } from "react";

const useClickOutside = (
  ref: RefObject<HTMLDivElement>,
  cb: () => void
): void => {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as HTMLDivElement)
      ) {
        cb();
      }
    };

    // Bind the event listener
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [cb, ref]);
};

export default useClickOutside;
