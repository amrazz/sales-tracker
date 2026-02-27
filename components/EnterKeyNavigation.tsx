'use client';

import { useEffect, useCallback } from 'react';

export default function EnterKeyNavigation() {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            const target = e.target as HTMLElement;

            // Only handle enter key on inputs and selects inside forms
            if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'select') {
                const form = target.closest('form');
                if (form) {
                    // Find all focusable elements inside the form
                    const focusableElements = form.querySelectorAll(
                        'input, select, textarea, button[type="submit"]'
                    ) as NodeListOf<HTMLElement>;

                    // Filter out hidden, disabled, or non-tabbable elements
                    const elementsArray = Array.from(focusableElements).filter(
                        (el) => !el.hidden && !(el as any).disabled && el.tabIndex >= 0 && el.offsetHeight > 0
                    );

                    const currentIndex = elementsArray.indexOf(target);
                    // If not the last element, focus the next one instead of submitting
                    if (currentIndex > -1 && currentIndex < elementsArray.length - 1) {
                        e.preventDefault(); // Prevent form submission
                        elementsArray[currentIndex + 1].focus();
                    }
                    // Else, let the default behavior (form submission) happen
                }
            }
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return null;
}
