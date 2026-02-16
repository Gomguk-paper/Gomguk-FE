/**
 * Resolves an image URL to a usable HTTP URL.
 * Handles s3:// protocols by routing them through the local proxy.
 */
export const resolveImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;

    // Handle s3:// protocol
    if (url.startsWith('s3://')) {
        // Expected format: s3://bucket-name/path/to/image.png
        // We want to transform to: /api/s3-images/path/to/image.png

        // Remove s3:// prefix
        const path = url.replace('s3://', '');

        // Split to get bucket and key
        const parts = path.split('/');
        if (parts.length > 1) {
            const bucket = parts[0];
            const key = parts.slice(1).join('/');

            // Currently we only support the 'papers' bucket via our proxy
            // If we need to support multiple buckets, we might need different proxies or a more dynamic one
            if (bucket === 'papers') {
                return `/api/s3-images/${key}`;
            }
        }

        // Fallback if bucket doesn't match or parsing fails, return as is (might still fail in browser)
        return url;
    }

    return url;
};
