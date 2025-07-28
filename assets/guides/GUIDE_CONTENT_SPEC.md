# First Aid Guide Content Specification

## Overview

This document defines the JSON structure and content requirements for First Aid Room app guides.

## File Structure

```
assets/guides/
├── content/
│   ├── manifest.json       # Guide registry and metadata
│   ├── version.json        # Version tracking
│   ├── [guide-id].json     # Individual guide files
│   └── ...
└── images/
    ├── [guide-id]_[step].png  # Step illustrations
    └── ...
```

## JSON Schema

### Guide Structure

```json
{
  "id": "string",          // Unique identifier (kebab-case)
  "title": "string",       // Display title
  "category": "string",    // One of: basic_life_support, wounds_bleeding, etc.
  "severity": "string",    // One of: low, medium, high, critical
  "summary": "string",     // Brief description (max 200 chars)
  "content": {
    "steps": [
      {
        "order": "number",         // Sequential from 1
        "title": "string",         // Step heading
        "description": "string",   // Detailed instructions
        "imageUrl": "string",      // Optional: guides/images/[name].png
        "videoUrl": "string",      // Optional: for future use
        "duration": "number"       // Optional: seconds
      }
    ],
    "warnings": ["string"],        // Important cautions
    "whenToSeekHelp": ["string"], // Medical attention triggers
    "preventionTips": ["string"]   // Optional: prevention advice
  },
  "searchTags": ["string"],        // Keywords for search
  "version": "number",             // Content version (integer)
  "isOfflineAvailable": "boolean", // Always true for MVP
  "viewCount": "number",           // Usage tracking
  "lastReviewedAt": "string",      // ISO 8601 date
  "createdAt": "string",           // ISO 8601 date
  "updatedAt": "string"            // ISO 8601 date
}
```

### Manifest Structure

```json
{
  "currentVersion": {
    "version": "number",
    "releaseDate": "string",
    "releaseNotes": "string",
    "minimumAppVersion": "string"
  },
  "guides": [
    {
      "id": "string",
      "version": "number",
      "category": "string",
      "tags": ["string"],
      "author": "string",
      "reviewedBy": "string",
      "lastReviewedAt": "string",
      "contentHash": "string",
      "locale": "string"
    }
  ],
  "lastUpdated": "string",
  "totalGuides": "number"
}
```

## Content Guidelines

### Categories

- `basic_life_support`: CPR, choking, recovery position
- `wounds_bleeding`: Cuts, lacerations, hemorrhage control
- `burns_scalds`: Thermal, chemical, electrical burns
- `fractures_sprains`: Bone and joint injuries
- `medical_emergencies`: Heart attack, stroke, seizures
- `environmental_emergencies`: Heat/cold exposure, drowning
- `poisoning_overdose`: Ingestion, inhalation poisoning
- `pediatric_emergencies`: Child-specific procedures

### Severity Levels

- `low`: Minor issues, self-care appropriate
- `medium`: Moderate concern, medical follow-up advised
- `high`: Serious condition, urgent care needed
- `critical`: Life-threatening, immediate 911 call

### Writing Style

1. **Clear and Concise**: Use simple, direct language
2. **Action-Oriented**: Start with verbs (Check, Apply, Call)
3. **Numbered Steps**: Logical sequence, one action per step
4. **Time Indicators**: Include durations where relevant
5. **Visual Aids**: Reference images for complex actions

### Image Requirements

- **Format**: PNG only
- **Dimensions**: Max 800x600 pixels
- **Size**: Max 500KB per image
- **Naming**: `[guide-id]_[step-number].png`
- **Content**: Clear illustrations, no text overlays
- **Accessibility**: Descriptive alt text required

## Validation Rules

1. All required fields must be present
2. Step order must be sequential (1, 2, 3...)
3. At least one search tag required
4. Category must match enum values
5. Severity must match enum values
6. Version must be positive integer
7. Dates must be valid ISO 8601 format

## Example Guide

See `cpr-adult.json` for a complete example implementation.

## Medical Review Process

All content must be:
1. Written by qualified medical professionals
2. Reviewed by licensed physicians
3. Updated based on current medical guidelines
4. Re-reviewed annually or when guidelines change

## Localization

- Current version supports `en-US` only
- Structure supports future localization
- Maintain locale field for compatibility