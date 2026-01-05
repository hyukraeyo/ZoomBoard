"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
import styles from './CommandList.module.css';
import { SuggestionItem } from './extensions/SlashCommand';

interface CommandListProps {
    items: SuggestionItem[];
    command: (item: SuggestionItem) => void;
}

export interface CommandListRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<CommandListRef, CommandListProps>((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
                return true;
            }

            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length);
                return true;
            }

            if (event.key === 'Enter') {
                selectItem(selectedIndex);
                return true;
            }

            return false;
        },
    }));

    useEffect(() => {
        // Reset selection to first item when items change (e.g. user types to filter)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedIndex(0);
    }, [props.items]);

    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedIndex]);

    return (
        <div className={styles.commandList} ref={listRef}>
            {props.items.length > 0 ? (
                props.items.map((item, index) => (
                    <button
                        key={index}
                        className={`${styles.commandItem} ${index === selectedIndex ? styles.selected : ''}`}
                        onClick={() => selectItem(index)}
                    >
                        <div className={styles.iconBox}>
                            <item.icon size={18} />
                        </div>
                        <div className={styles.textBox}>
                            <p className={styles.title}>{item.title}</p>
                            <p className={styles.description}>{item.description}</p>
                        </div>
                    </button>
                ))
            ) : (
                <div className={styles.noResults}>검색 결과가 없습니다.</div>
            )}
        </div>
    );
});

CommandList.displayName = 'CommandList';

export default CommandList;
