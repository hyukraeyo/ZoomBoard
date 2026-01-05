import Image from '@tiptap/extension-image';

export const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            alignment: {
                default: 'center',
                renderHTML: attributes => {
                    return {
                        'data-align': attributes.alignment,
                    };
                },
                parseHTML: element => element.getAttribute('data-align') || 'center',
            },
            width: {
                default: '100%',
                renderHTML: attributes => {
                    return {
                        style: `width: ${attributes.width}`,
                    };
                },
                parseHTML: element => element.style.width || '100%',
            },
        };
    },
});
