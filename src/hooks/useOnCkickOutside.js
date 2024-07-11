import { useEffect } from "react";

//this hook detects clickd outside of the specified conponent and calls the provided handleer function
export default function useOnclickOutside(ref, handler) {
    useEffect(() => {
        //Define the listener function to be called on click/touch events
        const listener = (event) => {
            //if the click / touch event originated inside the element do nothing
            if(!ref.current || ref.current.contains(event.target)) {
                return ;
            }

            //otherwise, call the provided handler function
            handler(event);
        };

        //Add event listener for mousedown and touch start events on the documents
        document.addEventListener('mousedown', listener)
        document.addEventListener('touchstart', listener)

        //cleanup dunction to remove the event listeners when the components unmounts or when the ref/handler dependencies change
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);   // Only run this effect when the ref or handler function changes
}