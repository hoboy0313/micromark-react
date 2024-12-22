/* eslint-disable */
import '@/styles/reset.css';
import '@/styles/tailwind.css';
import '@hoboy/micromark-react/index.scss';
/* eslint-enable */

/* eslint-disable max-len */
import {useCallback, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MicroMark, MicroMarkRef, type Typing} from '@hoboy/micromark-react';
import {Input, Checkbox, Button} from '@material-tailwind/react';

const App = () => {
    const [value, setValue] = useState('');

    const [typing, setTyping] = useState<Typing>({
        enabled: false,
        charactersPerSecond: 3,
    });

    const markdownRef = useRef<MicroMarkRef>(null!);

    const textareaRef = useRef<HTMLTextAreaElement>(null!);

    const sync = useCallback(() => {
        setValue(textareaRef.current.value);
    }, []);

    const reset = useCallback(() => {
        markdownRef.current.reset();
        setValue('');
    }, []);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            markdownRef.current.nativeElement.scrollTo({
                top: markdownRef.current.nativeElement.scrollHeight,
            });
        });

        observer.observe(markdownRef.current.nativeElement, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className="h-[100vh] flex flex-col">
            <header className="w-full h-10 shrink-0 shadow-md z-10 flex items-center">
                <div className="w-[220px] pl-4">
                    Logo
                </div>

                <div>
                    <Button size="sm" onClick={sync}>Sync</Button>
                    <Button size="sm" onClick={reset}>Reset</Button>
                </div>
            </header>
            <main className="w-full flex flex-1 overflow-hidden">
                {/* fields */}
                <section className="w-[220px] border-r-[1px] border-solid border-r-gray-300 p-[10px] flex flex-col gap-5">
                    <Checkbox
                        color="blue"
                        label="enabled"
                        checked={typing.enabled}
                        onChange={e => setTyping(prev => ({...prev, enabled: e.target.checked}))}
                    />
                    {
                        typing.enabled && (
                            <Input type="number" label="Char Per Second" value={typing.charactersPerSecond} onChange={e => setTyping(prev => ({...prev, charactersPerSecond: +e.target.value}))} />
                        )
                    }
                </section>

                {/* input */}
                <textarea
                    ref={textareaRef}
                    className="flex-1 outline-none border-r-[1px] border-solid border-r-gray-300 resize-none p-1"
                    placeholder="input the markdown content..."
                />

                {/* show */}
                <MicroMark
                    ref={markdownRef}
                    className="flex-1 overflow-auto p-3 border-r-[1px] border-solid border-r-gray-300"
                    typing={typing}
                    value={value}
                />
            </main>
        </div>
    );
};

createRoot(document.getElementById('root')!).render(<App />);
