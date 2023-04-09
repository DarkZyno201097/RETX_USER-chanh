import { useEffect } from "react";



export default function useOutsideComponent(ref: any, action: () => void) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                action();
            }
        }

        // Bind the event listener
        document.addEventListener("mouseover", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mouseover", handleClickOutside);
        };
    }, [ref]);
}
