declare module 'unique-selector' {
  export type GetSelectorOptions = {
    selectorTypes?: string[];
    excludeRegex?: RegExp;
  };

  export default function getSelector(element: HTMLElement, options: GetSelectorOptions): string;
}
