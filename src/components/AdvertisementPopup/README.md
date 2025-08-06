# Advertisement Popup Component

## Overview
The Advertisement Popup component displays advertisements from the API in a modal popup format. It supports both image and HTML content advertisements, with navigation controls for multiple advertisements.

## Features
- **Image Support**: Displays advertisements with background images
- **HTML Content**: Renders HTML content advertisements
- **Slider Navigation**: Navigate between multiple advertisements with arrows and dots
- **View Tracking**: Automatically tracks advertisement views
- **Click Tracking**: Tracks advertisement clicks
- **Session Management**: Avoids showing the same advertisement multiple times in one session
- **Responsive Design**: Works on all device sizes
- **Internationalization**: Supports Arabic and English languages

## API Endpoints Used
- `GET /api/advertisements/stores/{storeId}/advertisements/active` - Fetch active advertisements
- `POST /api/advertisements/{advertisementId}/view` - Track advertisement view
- `POST /api/advertisements/{advertisementId}/click` - Track advertisement click

## Props
None - The component uses context to get `storeId` from `AppDataContext`.

## Usage
```jsx
import AdvertisementPopup from './components/AdvertisementPopup/AdvertisementPopup';

// In your App.jsx or main component
<AdvertisementPopup />
```

## Data Structure
The component expects advertisement data in the following format:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "_id": "687f92a17e0083c9df59c3b8",
    "store": "687c9bb0a7b3f2a0831c4675",
    "title": "Advertisement Title",
    "htmlContent": "<p>HTML content here</p>",
    "backgroundImageUrl": "https://example.com/image.jpg",
    "position": "top",
    "isActive": true,
    "priority": 1,
    "clickCount": 0,
    "viewCount": 1,
    "startDate": "2025-07-22T13:31:13.752Z",
    "createdAt": "2025-07-22T13:31:13.756Z",
    "updatedAt": "2025-08-03T07:00:39.688Z"
  }
}
```

## Features Details

### Image Display
- If `backgroundImageUrl` is present, displays the image
- Shows title overlay on image if available
- Clickable to track clicks

### HTML Content
- If `htmlContent` is present, renders HTML content
- Uses `dangerouslySetInnerHTML` for rendering
- Clickable to track clicks

### Navigation
- Previous/Next arrows for multiple advertisements
- Dot indicators showing current position
- Only shows navigation controls when multiple advertisements exist

### Session Management
- Uses localStorage to track shown advertisements
- Prevents showing same advertisement multiple times per session
- Clears on browser session end

### Responsive Design
- Adapts to different screen sizes
- Mobile-optimized controls
- Touch-friendly navigation

## Styling
The component uses CSS modules with the following main classes:
- `.advertisement-popup-overlay` - Modal backdrop
- `.advertisement-popup` - Main popup container
- `.advertisement-popup-close` - Close button
- `.advertisement-image-container` - Image wrapper
- `.advertisement-html-content` - HTML content wrapper
- `.advertisement-nav-btn` - Navigation buttons
- `.advertisement-dots` - Dot indicators

## Dependencies
- React
- react-i18next (for translations)
- AppDataContext (for storeId)

## Browser Support
- Modern browsers with ES6+ support
- LocalStorage support required
- Fetch API support required 