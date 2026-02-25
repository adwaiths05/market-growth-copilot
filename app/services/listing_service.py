import re
from typing import Optional

class ListingService:
    """
    Validates and cleans marketplace URLs to ensure they are supported 
    before starting an analysis job.
    """
    SUPPORTED_DOMAINS = ["amazon.com", "ebay.com", "etsy.com", "walmart.com", "shopify.com"]

    @classmethod
    def validate_and_clean_url(cls, url: str) -> Optional[str]:
        """
        Ensures the URL belongs to a supported marketplace and strips tracking parameters.
        """
        try:
            # Basic regex to extract domain
            domain_match = re.search(r"https?://(www\.)?([^/]+)", url)
            if not domain_match:
                return None
            
            domain = domain_match.group(2).lower()
            
            if any(supported in domain for supported in cls.SUPPORTED_DOMAINS):
                # Strip query parameters (tracking IDs) for cleaner analysis
                return url.split('?')[0]
            return None
        except Exception:
            return None

listing_service = ListingService()