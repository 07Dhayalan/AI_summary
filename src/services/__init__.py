

google_api_key = 'AIzaSyC6r2hBBGsjFopWn7L49fJjPL_d1VCAwzU'


realEstate_prompt = """
Below is raw HTML content from a real estate listings site. Your task is to parse and extract as much relevant property data as possible from the HTML, and return the result strictly in JSON format with the following structure:

If a particular field is not available or cannot be found in the HTML, **omit that field entirely from the output JSON** (do not include it as null or empty).

The JSON response must contain:
1. **total_properties**: The total number of properties listed on the page.
2. **lowest_price_property**: The property with the lowest listed price, including:
   - price (formatted as "$XXX,XXX")
   - address (as a string)
   - number of bedrooms
   - number of bathrooms
   - square footage
   - type (e.g., condo, house, multi-family)
   - year built (if available)
3. **highest_price_property**: The property with the highest listed price, including:
   - price (formatted as "$XXX,XXX")
   - address (as a string)
   - number of bedrooms
   - number of bathrooms
   - square footage
   - type (e.g., condo, house, multi-family)
   - year built (if available)
4. **sold_properties_count**: The total number of properties marked as "sold" (if available).
5. **unsold_properties_count**: The total number of properties that are still unsold.
6. **newly_listed_properties**: A list of properties that are newly listed or marked as "New" or "Just Listed," including:
   - address (string)
   - price (formatted as "$XXX,XXX")
   - type (string: condo, house, etc.)
   - number of bedrooms
   - number of bathrooms
   - square footage
   - year built (if available)
7. **recently_sold_properties**: A list of recently sold properties, including:
   - address (string)
   - price (formatted as "$XXX,XXX")
   - type (string: condo, house, etc.)
   - number of bedrooms
   - number of bathrooms
   - square footage
   - year built (if available)
8. **categorized_properties**: A breakdown of properties by type:
   - condo: list of properties of type "condo"
   - house: list of properties of type "house"
   - multi-family: list of properties of type "multi-family"
   - other: list of other property types
9. **property_summary_table**: A table with a summary of each property that includes:
   - address (string)
   - price (formatted as "$XXX,XXX")
   - type (string)
   - status (Sold | Unsold)
   - number of bedrooms
   - number of bathrooms
   - square footage
   - year built (if available)
   - any notable features (e.g., pool, garage, etc.)
10. **property_details**: For each property, include:
    - Address
    - Price
    - Type (e.g., condo, house, etc.)
    - Bedrooms
    - Bathrooms
    - Square footage
    - Year built (if available)
    - Listing date
    - Additional features (e.g., pool, garden, balcony, etc.)
    - Description of the property (if available)
    - Contact details (e.g., agent name, phone number, etc. if available)
11. **property_price_trends**: For each property, if available:
    - Price change history (e.g., price drop, increase)
    - Days on the market (time listed)
    - Last price update (if available)

The JSON must be formatted as follows:
{{
  "total_properties": int,
  "lowest_price_property": {{
    "price": "$", 
    "address": "string",
    "bedrooms": int,
    "bathrooms": int,
    "square_footage": int,
    "type": "string",
    "year_built": int
  }},
  "highest_price_property": {{
    "price": "$", 
    "address": "string",
    "bedrooms": int,
    "bathrooms": int,
    "square_footage": int,
    "type": "string",
    "year_built": int
  }},
  "sold_properties_count": int,
  "unsold_properties_count": int,
  "newly_listed_properties": [
    {{
      "address": "string", 
      "price": "$", 
      "type": "string",
      "bedrooms": int,
      "bathrooms": int,
      "square_footage": int,
      "year_built": int
    }}
  ],
  "recently_sold_properties": [
    {{
      "address": "string", 
      "price": "$", 
      "type": "string",
      "bedrooms": int,
      "bathrooms": int,
      "square_footage": int,
      "year_built": int
    }}
  ],
  "categorized_properties": {{
    "condo": [...],
    "house": [...],
    "multi-family": [...],
    "other": [...]
  }},
  "property_summary_table": [
    {{
      "address": "string", 
      "price": "$", 
      "type": "string", 
      "status": "Sold" | "Unsold",
      "bedrooms": int,
      "bathrooms": int,
      "square_footage": int,
      "year_built": int,
      "features": ["string"]
    }}
  ],
  "property_details": [
    {{
      "address": "string",
      "price": "$",
      "type": "string",
      "bedrooms": int,
      "bathrooms": int,
      "square_footage": int,
      "year_built": int,
      "listing_date": "string",
      "additional_features": ["string"],
      "description": "string",
      "contact_details": {{
        "agent_name": "string",
        "phone_number": "string"
      }}
    }}
  ],
  "property_price_trends": [
    {{
      "address": "string",
      "price_changes": ["string"],
      "days_on_market": int,
      "last_price_update": "string"
    }}
  ]
}}

Do not include explanations or markdown formatting. Provide the result only in valid JSON format.

Here is the HTML content:
'''{html}'''
"""


generalize_prompt = """
Below is raw HTML content from a website. Your task is to parse and summarize the key information, extracting relevant data about the webpage's content. Provide the result strictly in JSON format with the following structure.

If a particular field is not available or cannot be found in the HTML, **omit that field entirely from the output JSON** (do not include it as null or empty).

The structure to follow is:

{{
  "page_title": "Title of the page (string)",
  "meta_description": "Short description of the page content (string, if available)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "total_images": int,
  "total_links": int,
  "header_info": {{
    "main_header": "Main heading of the page (string)",
    "sub_headers": ["sub_header1", "sub_header2", "sub_header3"]
  }},
  "content_summary": {{
    "introduction": "Short introductory text or first paragraph (string)",
    "main_points": ["point 1", "point 2", "point 3"],
    "conclusion": "Closing or concluding statement from the content (string)"
  }},
  "metadata": {{
    "author": "Author of the page",
    "published_date": "Date the page was published (string)",
    "last_updated": "Date the page was last updated (string)",
    "categories": ["category1", "category2"]
  }},
  "external_sources": {{
    "external_links": ["url1", "url2"],
    "referenced_sources": ["source1", "source2"]
  }},
  "tables": [
    {{
      "table_title": "Title of the table (string, if available)",
      "columns": ["column1", "column2"],
      "data": [
        ["row1_col1", "row1_col2"],
        ["row2_col1", "row2_col2"]
      ]
    }}
  ],
  "images": [
    {{
      "image_url": "URL of the image",
      "alt_text": "Alt text for the image (if available)",
      "caption": "Caption of the image (if available)"
    }}
  ],
  "page_summary": "Provide a detailed, human-readable summary that describes the main purpose, structure, and content of the web page. This summary should combine and narrate the extracted data, describing the page type, layout, key elements, tone, and any patterns.",
  "additional_notes": "Any additional notes or insights that should be included in the summary."
}}

Only include fields with meaningful data. Do not use nulls or placeholder values. Do not return any markdown formatting or explanations—only a clean, valid JSON object.

Here is the HTML content:
'''{html}'''
"""

Broadband_prompt = """
You are a professional data extractor specialized in telecommunications and broadband data.

Your task is to analyze the following HTML content and extract all relevant broadband service plan information into a structured **Json format.

If a particular field is not available or cannot be found in the HTML, **omit that field entirely from the output JSON** (do not include it as null or empty).

📋 The data may include (if available in the HTML):
- Provider name
- Download speed
- Upload speed
- Connection type (e.g., fiber, cable, DSL, satellite, 5G, fixed wireless)
- Monthly price
- Data cap (or "Unlimited" if stated)
- Contract length or terms
- Equipment fee or installation cost
- Availability location or address
- Additional features (e.g., Wi-Fi included, bundled services)

📦 Output Format:
- Return a **JSON array**, where each object represents a single broadband plan or provider listing.
- Use consistent and descriptive keys such as:
  - `"provider"`
  - `"download_speed"`
  - `"upload_speed"`
  - `"connection_type"`
  - `"price"`
  - `"data_cap"`
  - `"contract"`
  - `"equipment_fee"`
  - `"availability"`
  - `"features"`
- Only include keys that are explicitly present in the HTML.
- Normalize all text (strip newlines, extra spaces).

⚠️ Rules:
1. Do not fabricate or guess missing values.
2. Do not include markdown, explanations, or additional formatting.
3. Do not wrap the response — return **only the valid JSON array**.
4. If multiple plans/providers exist, return each one as a separate object in the array.

Here is the HTML content:
'''{html}'''
"""