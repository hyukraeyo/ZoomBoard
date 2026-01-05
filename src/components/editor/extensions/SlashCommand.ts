import { Extension, ReactRenderer } from '@tiptap/react';
import { Suggestion, SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { Heading1, Heading2, Heading3, Text, List, ListOrdered, CheckSquare, Quote, Code } from 'lucide-react';
import { Editor, Range } from '@tiptap/core';
import CommandList, { CommandListRef } from '../CommandList';

export interface SuggestionItem {
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    command: (props: { editor: Editor; range: Range }) => void;
}

export default Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: { editor: Editor; range: Range; props: SuggestionItem }) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

export const getSuggestionItems = ({ query }: { query: string }): SuggestionItem[] => {
    return [
        {
            title: '텍스트 (Text)',
            description: '일반 텍스트를 작성합니다.',
            icon: Text,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('paragraph').run();
            },
        },
        {
            title: '제목 1 (Heading 1)',
            description: '가장 큰 제목을 작성합니다.',
            icon: Heading1,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
            },
        },
        {
            title: '제목 2 (Heading 2)',
            description: '중간 크기의 제목을 작성합니다.',
            icon: Heading2,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
            },
        },
        {
            title: '제목 3 (Heading 3)',
            description: '작은 크기의 제목을 작성합니다.',
            icon: Heading3,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
            },
        },
        {
            title: '체크박스 목록 (To-do List)',
            description: '할 일 목록을 관리합니다.',
            icon: CheckSquare,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleTaskList().run();
            },
        },
        {
            title: '글머리 기호 목록 (Bullet List)',
            description: '간단한 목록을 작성합니다.',
            icon: List,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
            },
        },
        {
            title: '번호 매기기 목록 (Ordered List)',
            description: '번호가 있는 목록을 작성합니다.',
            icon: ListOrdered,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
            },
        },
        {
            title: '인용 (Quote)',
            description: '인용문을 작성합니다.',
            icon: Quote,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run();
            },
        },
        {
            title: '코드 블록 (Code Block)',
            description: '코드 문법 강조가 포함된 블록을 추가합니다.',
            icon: Code,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
            },
        },
    ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
};

export const renderItems = () => {
    let component: ReactRenderer | null = null;
    let popup: TippyInstance[] | null = null;

    return {
        onStart: (props: SuggestionProps) => {
            component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
            });

            if (!props.clientRect) {
                return;
            }

            popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
            });
        },

        onUpdate(props: SuggestionProps) {
            component?.updateProps(props);

            if (popup && props.clientRect) {
                popup[0].setProps({
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                });
            }
        },

        onKeyDown(props: SuggestionKeyDownProps) {
            if (props.event.key === 'Escape') {
                popup?.[0].hide();
                return true;
            }
            return (component?.ref as CommandListRef | null)?.onKeyDown(props) || false;
        },

        onExit() {
            popup?.[0].destroy();
            component?.destroy();
        },
    };
};
