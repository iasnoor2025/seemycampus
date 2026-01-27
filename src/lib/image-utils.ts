
/**
 * Converts various image URLs to direct accessible links.
 * Specifically handles Google Drive sharing links.
 * 
 * @param url The original image URL
 * @returns The direct link formatted URL or the original URL if no conversion needed
 */
export function getDirectImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    // Handle Google Drive links
    // Pattern 1: https://drive.google.com/file/d/1zPhN0ATwce5nX8ewVD23zdcTG7fh61uW/view
    // Pattern 2: https://drive.google.com/open?id=1zPhN0ATwce5nX8ewVD23zdcTG7fh61uW
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);

        if (idMatch && idMatch[1]) {
            // Use the thumbnail endpoint which is more reliable for embedding and avoids 403s
            // sz=w1000 gets a high quality image up to 1000px wide
            return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
        }
    }

    return url;
}
