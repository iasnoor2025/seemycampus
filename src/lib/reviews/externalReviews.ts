/**
 * External Reviews Integration
 * Fetches reviews from Google Maps, college websites, and other sources
 */

import * as cheerio from "cheerio";

export type ReviewSource = "google_maps" | "college_website" | "internet" | "internal";

export interface ExternalReview {
  rating: number;
  title?: string;
  review: string;
  reviewerName?: string;
  reviewerEmail?: string;
  externalId: string;
  externalUrl?: string;
  externalDate?: Date;
  source: ReviewSource;
}

/**
 * Fetch reviews from Google Maps/Places API
 */
export async function fetchGoogleMapsReviews(
  placeId: string,
  apiKey?: string
): Promise<ExternalReview[]> {
  if (!apiKey) {
    console.warn("Google Maps API key not provided");
    return [];
  }

  try {
    // Use Google Places API (New) - Reviews endpoint
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,reviews&key=${apiKey}`;
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
    });

    if (!response.ok) {
      // Fallback to Places API (Legacy) if new API fails
      return await fetchGoogleMapsReviewsLegacy(placeId, apiKey);
    }

    const data = await response.json();
    const reviews = data.reviews || [];

    return reviews.map((review: any) => ({
      rating: review.rating || 0,
      title: review.text?.substring(0, 100) || undefined,
      review: review.text || "",
      reviewerName: review.authorAttribution?.displayName || "Anonymous",
      externalId: `google_${review.publishTime || review.relativePublishTimeDescription || Date.now()}`,
      externalUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      externalDate: review.publishTime ? new Date(review.publishTime) : undefined,
      source: "google_maps" as ReviewSource,
    }));
  } catch (error) {
    console.error("Error fetching Google Maps reviews:", error);
    // Try legacy API as fallback
    return await fetchGoogleMapsReviewsLegacy(placeId, apiKey);
  }
}

/**
 * Fallback to Google Places API (Legacy)
 */
async function fetchGoogleMapsReviewsLegacy(
  placeId: string,
  apiKey: string
): Promise<ExternalReview[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.result?.reviews) {
      return [];
    }

    return data.result.reviews.map((review: any) => ({
      rating: review.rating || 0,
      title: review.text?.substring(0, 100) || undefined,
      review: review.text || "",
      reviewerName: review.author_name || "Anonymous",
      externalId: `google_${review.time || Date.now()}_${review.author_name || "anon"}`,
      externalUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      externalDate: review.time ? new Date(review.time * 1000) : undefined,
      source: "google_maps" as ReviewSource,
    }));
  } catch (error) {
    console.error("Error fetching Google Maps reviews (legacy):", error);
    return [];
  }
}

/**
 * Fetch reviews from college website using web scraping
 */
export async function fetchCollegeWebsiteReviews(
  websiteUrl: string,
  collegeName: string
): Promise<ExternalReview[]> {
  if (!websiteUrl) {
    return [];
  }

  try {
    // Normalize URL
    const url = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    
    // Use cheerio to parse HTML (already in dependencies)
    const $ = cheerio.load(html);

    const reviews: ExternalReview[] = [];

    // Common patterns for review sections
    // Pattern 1: Reviews in structured data (JSON-LD)
    $('script[type="application/ld+json"]').each((_: any, elem: any) => {
      try {
        const jsonData = JSON.parse($(elem).html() || "{}");
        if (jsonData["@type"] === "Review" || jsonData["@type"] === "AggregateRating") {
          if (jsonData.reviewRating?.ratingValue) {
            reviews.push({
              rating: Math.round(parseFloat(jsonData.reviewRating.ratingValue)),
              review: jsonData.reviewBody || jsonData.description || "",
              reviewerName: jsonData.author?.name || "Anonymous",
              externalId: `website_${jsonData.datePublished || Date.now()}_${jsonData.author?.name || "anon"}`,
              externalUrl: url,
              externalDate: jsonData.datePublished ? new Date(jsonData.datePublished) : undefined,
              source: "college_website" as ReviewSource,
            });
          }
        }
        // Handle ReviewAggregate
        if (Array.isArray(jsonData)) {
          jsonData.forEach((item: any) => {
            if (item["@type"] === "Review" && item.reviewRating?.ratingValue) {
              reviews.push({
                rating: Math.round(parseFloat(item.reviewRating.ratingValue)),
                review: item.reviewBody || item.description || "",
                reviewerName: item.author?.name || "Anonymous",
                externalId: `website_${item.datePublished || Date.now()}_${item.author?.name || "anon"}`,
                externalUrl: url,
                externalDate: item.datePublished ? new Date(item.datePublished) : undefined,
                source: "college_website" as ReviewSource,
              });
            }
          });
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    // Pattern 2: Common review class names
    $(".review, .testimonial, .student-review, [class*='review']").each((_: any, elem: any) => {
      const text = $(elem).text().trim();
      const ratingMatch = text.match(/(\d)\s*(?:star|out of|rating)/i);
      
      if (text.length > 50 && ratingMatch) {
        const rating = parseInt(ratingMatch[1]);
        if (rating >= 1 && rating <= 5) {
          reviews.push({
            rating,
            review: text.substring(0, 1000),
            reviewerName: $(elem).find(".author, .name, .reviewer").first().text().trim() || "Anonymous",
            externalId: `website_${Date.now()}_${Math.random()}`,
            externalUrl: url,
            source: "college_website" as ReviewSource,
          });
        }
      }
    });

    return reviews.slice(0, 20); // Limit to 20 reviews
  } catch (error) {
    console.error(`Error fetching reviews from ${websiteUrl}:`, error);
    return [];
  }
}

/**
 * Search for reviews on general internet sources
 * This is a placeholder - in production, you might use:
 * - Web scraping services (ScraperAPI, ScrapingBee)
 * - Review aggregation APIs
 * - Custom scraping logic for specific sites
 */
export async function fetchInternetReviews(
  collegeName: string,
  location?: string
): Promise<ExternalReview[]> {
  // This is a simplified implementation
  // In production, you might want to:
  // 1. Search review sites like Shiksha, education portals, etc.
  // 2. Use web scraping services
  // 3. Integrate with review aggregation APIs

  const reviews: ExternalReview[] = [];

  try {
    // Example: Search for reviews on common Indian education review sites
    const searchTerms = `${collegeName} ${location || ""} review`.trim();
    
    // Note: Actual implementation would require:
    // - API access to review sites
    // - Web scraping with proper rate limiting
    // - Legal compliance with terms of service
    
    // For now, return empty array - this can be extended with actual implementations
    console.log(`Internet review search for: ${searchTerms}`);
    
    return reviews;
  } catch (error) {
    console.error("Error fetching internet reviews:", error);
    return [];
  }
}

/**
 * Fetch all external reviews for a college
 */
export async function fetchAllExternalReviews(
  college: {
    name: string;
    website?: string | null;
    googlePlaceId?: string | null;
    location?: string | null;
  }
): Promise<ExternalReview[]> {
  const allReviews: ExternalReview[] = [];

  // Fetch from Google Maps if Place ID is available
  if (college.googlePlaceId) {
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const googleReviews = await fetchGoogleMapsReviews(college.googlePlaceId, googleApiKey);
    allReviews.push(...googleReviews);
  }

  // Fetch from college website
  if (college.website) {
    const websiteReviews = await fetchCollegeWebsiteReviews(college.website, college.name);
    allReviews.push(...websiteReviews);
  }

  // Fetch from internet (optional - can be enabled if needed)
  // const internetReviews = await fetchInternetReviews(college.name, college.location || undefined);
  // allReviews.push(...internetReviews);

  return allReviews;
}

