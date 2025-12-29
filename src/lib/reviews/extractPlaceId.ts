/**
 * Utility to extract Google Place ID from Google Maps URLs
 */

/**
 * Extract Place ID from various Google Maps URL formats
 * 
 * @param url - Google Maps URL
 * @returns Place ID if found, null otherwise
 * 
 * Supported URL formats:
 * - https://www.google.com/maps/place/.../?cid=...
 * - https://www.google.com/maps/place/.../data=...!1s...!4m...
 * - https://maps.google.com/?cid=...
 * - https://www.google.com/maps/search/.../@.../data=...!1s...
 */
export function extractPlaceIdFromUrl(url: string): string | null {
  try {
    // Method 1: Extract from cid parameter (if present)
    const cidMatch = url.match(/[?&]cid=([^&]+)/);
    if (cidMatch) {
      // CID is not the same as Place ID, but we can use it to find Place ID
      // For now, we'll need to use the Places API to convert CID to Place ID
      return null; // CID requires API call to convert
    }

    // Method 2: Extract from data parameter (encoded format)
    // Format: data=...!1s0x...:0x...!4m...
    const dataMatch = url.match(/data=[^!]*!1s([^!]+)/);
    if (dataMatch) {
      const placeIdCandidate = dataMatch[1];
      // Place IDs typically start with specific patterns
      if (placeIdCandidate.includes('0x') || placeIdCandidate.length > 20) {
        // This might be a Place ID, but the format in URLs is encoded
        // We need to decode it properly
        return decodePlaceIdFromData(placeIdCandidate);
      }
    }

    // Method 3: Try to find Place ID in the URL path
    // Some URLs have it directly: /place/.../PLACE_ID
    const pathMatch = url.match(/\/place\/[^/]+\/([A-Za-z0-9_-]+)/);
    if (pathMatch && pathMatch[1].length > 20) {
      return pathMatch[1];
    }

    // Method 4: Extract from query parameters
    const urlObj = new URL(url);
    const placeId = urlObj.searchParams.get('place_id');
    if (placeId) {
      return placeId;
    }

    return null;
  } catch (error) {
    console.error('Error extracting Place ID from URL:', error);
    return null;
  }
}

/**
 * Decode Place ID from data parameter format
 */
function decodePlaceIdFromData(encoded: string): string | null {
  // The data parameter uses a special encoding
  // Format: 0x...:0x... or similar
  // This is complex and may require reverse engineering Google's encoding
  // For now, return null and suggest using the API
  return null;
}

/**
 * Extract Place ID from the provided URL
 * For the AIIMS Delhi URL, we'll need to use the Places API
 * or provide instructions on how to find it
 */
export function getPlaceIdFromUrl(url: string): {
  placeId: string | null;
  method: string;
  instructions: string;
} {
  const extracted = extractPlaceIdFromUrl(url);
  
  if (extracted) {
    return {
      placeId: extracted,
      method: 'extracted',
      instructions: 'Place ID found in URL',
    };
  }

  // If we can't extract it, provide instructions
  return {
    placeId: null,
    method: 'manual',
    instructions: `
      Unable to extract Place ID directly from this URL format.
      
      To find the Place ID:
      1. Open the Google Maps link in your browser
      2. Right-click on the location marker
      3. Select "What's here?" or check the URL
      4. Look for a parameter like "place_id=ChIJ..." in the URL
      5. Or use the Google Place ID Finder: https://developers.google.com/maps/documentation/places/web-service/place-id
      
      For AIIMS Delhi, you can also:
      - Search "AIIMS Delhi" on Google Maps
      - Click on the official listing
      - The Place ID will be in the URL or you can use the API
    `,
  };
}

