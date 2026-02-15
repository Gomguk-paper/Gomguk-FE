// Helper to clean abstract text - preserves $...$ math delimiters for KaTeX rendering
export const cleanAbstract = (text: string) => {
    if (!text) return { cleaned: "", sentences: [] };

    let cleaned = text;

    // 1) Remove $\renewcommand...$  or $\newcommand...$ preambles
    //    Match from $\ (re)newcommand all the way to the closing $
    //    This handles nested braces like $\renewcommand{\Re}{\mathbb{R}}$
    cleaned = cleaned.replace(/\$\\(?:re)?newcommand[^$]*\$/g, "");

    // 2) Also handle \renewcommand / \newcommand without $ wrapping (nested braces)
    cleaned = cleaned.replace(/\\(?:re)?newcommand\s*\{(?:[^{}]|\{[^{}]*\})*\}\s*(?:\[[^\]]*\])?\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, "");

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // Split into sentences while respecting $...$ math blocks
    // Temporarily replace math blocks to avoid splitting inside them
    const mathBlocks: string[] = [];
    const withPlaceholders = cleaned.replace(/\$\$[\s\S]*?\$\$|\$[^$]+?\$/g, (match) => {
        mathBlocks.push(match);
        return `__MATH_${mathBlocks.length - 1}__`;
    });

    const rawSentences = withPlaceholders.match(/[^.?!]+[.?!]+(?=\s|$)|[^.?!]+$/g) || [withPlaceholders];

    // Restore math blocks in sentences
    const sentences = rawSentences.map(s => {
        let restored = s.trim();
        restored = restored.replace(/__MATH_(\d+)__/g, (_, idx) => mathBlocks[parseInt(idx)]);
        return restored;
    }).filter(s => s.length > 0);

    // Restore math blocks in cleaned text
    let restoredCleaned = withPlaceholders;
    restoredCleaned = restoredCleaned.replace(/__MATH_(\d+)__/g, (_, idx) => mathBlocks[parseInt(idx)]);

    return {
        cleaned: restoredCleaned,
        sentences
    };
};
