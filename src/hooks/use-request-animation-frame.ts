
import {useCallback, useRef} from 'react';
import useLatest from './use-latest';

declare global {
    interface Window {
        webkitRequestAnimationFrame?: Window['requestAnimationFrame'];
        mozRequestAnimationFrame?: Window['requestAnimationFrame'];
        msRequestAnimationFrame?: Window['requestAnimationFrame'];
        oRequestAnimationFrame?: Window['requestAnimationFrame'];

        webkitCancelAnimationFrame?: Window['cancelAnimationFrame'];
        mozCancelAnimationFrame?: Window['cancelAnimationFrame'];
        msCancelAnimationFrame?: Window['cancelAnimationFrame'];
        oCancelAnimationFrame?: Window['cancelAnimationFrame'];
    }
}

/**
 * requestAnimationFrame polyfill.
 */
const requestAnimationFrame = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.msRequestAnimationFrame
    || window.oRequestAnimationFrame
    || function customRequestAnimationFrame(callback) {
        return window.setTimeout(callback, 16);
    };

/**
 * cancelAnimationFrame polyfill.
 */
const cancelAnimationFrame = window.cancelAnimationFrame
    || window.webkitCancelAnimationFrame
    || window.mozCancelAnimationFrame
    || window.msCancelAnimationFrame
    || window.oCancelAnimationFrame
    || function customCancelAnimationFrame(id) {
        return window.clearTimeout(id);
    };

export const useRequestAnimationFrame = <T extends (...args: any[]) => any>(callback: T) => {
    const callbackRef = useLatest(callback);
    const idRef = useRef<number>();

    const fn = useCallback(() => {
        if (idRef.current) {
            cancelAnimationFrame(idRef.current);
            idRef.current = undefined;
        }

        idRef.current = requestAnimationFrame(() => {
            callbackRef.current?.();
            idRef.current = undefined;
        });
    }, [callbackRef]);

    return fn;
};
