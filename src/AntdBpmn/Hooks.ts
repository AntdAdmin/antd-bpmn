import {MutableRefObject, useEffect, useRef} from "react";

export function useSaveHotKeyFunction(func: () => void) {
    const commandKeyDown: MutableRefObject<boolean> = useRef(false);
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.keyCode == 91 || e.keyCode == 224) {
                commandKeyDown.current = true;
            }
            if (commandKeyDown.current && e.keyCode == 83) {
                commandKeyDown.current = false;
                e.preventDefault();
                func();
                return false;
            }
            if (e.ctrlKey == true && e.keyCode == 83) {
                e.preventDefault();
                func();
                return false;
            }
        }
        document.addEventListener("keydown", onKeyDown);

        const onKeyUp = (e: any) => {
            if (e.keyCode == 91 || e.keyCode == 224) {
                commandKeyDown.current = false;
            }
        }

        document.addEventListener("keyup", onKeyUp);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
        }

    }, [])
}