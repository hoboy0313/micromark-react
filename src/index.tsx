import {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {micromark} from 'micromark';
import parser from 'html-react-parser';
import c from 'clsx';

import useLatest from './hooks/use-latest';
import {useRequestAnimationFrame} from './hooks/use-request-animation-frame';

import type {CompileOptions, ParseOptions, Encoding} from 'micromark-util-types';

interface Typing {
    /**
     * print the markdown content.
     * @default true
     */
    enabled?: boolean;

    /**
     * print characters per second.
     * @default 3
     */
    charactersPerSecond?: number;
}

type TypingStatus = 'none' | 'printing' | 'ending' | 'ended';

type MicroMarkProps = React.HTMLAttributes<HTMLDivElement> & {
    /**
     * markdown content.
     */
    value?: string;

    /**
     * markdown encoding.
     * @default 'utf-8'
     */
    encoding?: Encoding;

    extensions?: ParseOptions['extensions'];
    htmlExtensions?: CompileOptions['htmlExtensions'];

    /**
     * compile options.
     */
    compileOptions?: Omit<CompileOptions, 'htmlExtensions'>;

    /**
     * print the markdown content.
     * @default false
     */
    typing?: boolean | Typing;
};

interface MicroMarkRef {
    nativeElement: HTMLDivElement;
    reset: () => void;
}

const defaultPrintOptions = {
    enabled: true,
    charactersPerSecond: 3,
};

const formatPrintOptions = (options: MicroMarkProps['typing']) => {
    if (typeof options === 'boolean' || options === undefined || options === null) {
        return {
            ...defaultPrintOptions,
            enabled: options ?? defaultPrintOptions.enabled,
        };
    }

    return {
        ...defaultPrintOptions,
        ...options,
    };
};

const MicroMark = forwardRef<MicroMarkRef, MicroMarkProps>((props, ref) => {
    const {
        value,
        encoding,
        extensions,
        htmlExtensions,
        compileOptions = {},
        className,
        typing,
        ...restProps
    } = props;

    const typingOptionsRef = useLatest(formatPrintOptions(typing));
    const {enabled} = typingOptionsRef.current;

    const nativeElementRef = useRef<HTMLDivElement>(null!);
    const indexRef = useRef(enabled === true ? value?.length || 0 : 0);

    const [showValue, setShowValue] = useState<MicroMarkProps['value']>('');

    const [status, setStatus] = useState<TypingStatus>(() => {
        return enabled === true ? 'printing' : 'none';
    });

    const contextRef = useLatest({
        status,
        value: value || '',
    });

    const printing = useRequestAnimationFrame(() => {
        const isEnded = contextRef.current.status === 'ending'
            && indexRef.current >= contextRef.current.value.length - 1;

        if (isEnded) {
            setStatus('ended');
            return;
        }

        const currentValue = contextRef.current.value;

        if (!currentValue) {
            printing();
            return;
        }

        const startIndex = indexRef.current;
        const nextEndIndex = startIndex + typingOptionsRef.current.charactersPerSecond;

        const nextShowValue = contextRef.current.value.slice(0, nextEndIndex);

        setShowValue(nextShowValue);

        indexRef.current = Math.min(nextEndIndex, currentValue.length - 1);
        printing();
    });

    const htmlString = useMemo(() => {
        return showValue ? micromark(showValue, encoding, {
            ...compileOptions,
            extensions,
            htmlExtensions,
        }) : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showValue, encoding, extensions, htmlExtensions, compileOptions && Object.values(compileOptions).join('')]);

    const elements = useMemo(() => {
        return htmlString ? parser(htmlString) : null;
    }, [htmlString]);

    /**
     * following `enabled` to change `status`.
     */
    useEffect(() => {
        if (enabled) {
            if (contextRef.current.status === 'none') {
                setStatus('printing');
                printing();
            }
        } else if (contextRef.current.status === 'printing') {
            setStatus('ending');
            printing();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, contextRef]);

    // following `value` to change `showValue`.
    useEffect(() => {
        if (!enabled && ['none', 'ended'].includes(contextRef.current.status)) {
            setShowValue(value || '');
        }
    }, [enabled, value, contextRef]);

    useImperativeHandle(ref, () => ({
        nativeElement: nativeElementRef.current,
        reset: () => {
            const {enabled} = typingOptionsRef.current;
            const {value} = contextRef.current;
            if (enabled) {
                indexRef.current = 0;
                setShowValue('');
                setStatus('printing');
                printing();
            } else {
                indexRef.current = value?.length || 0;
                setShowValue(value || '');
                setStatus('none');
            }
        },
    }), [typingOptionsRef, contextRef, printing]);

    return (
        <div
            ref={nativeElementRef}
            role="markdown"
            aria-label="markdown"
            {...restProps}
            className={c(
                'so-micro-markdown',
                {'so-micro-markdown--printing': status === 'printing' || status === 'ending'},
                className
            )}
        >
            {elements}
        </div>
    );
});

MicroMark.displayName = 'MicroMark';

export {
    MicroMark,
};

export type {
    MicroMarkProps,
    MicroMarkRef,
    Typing,
};
