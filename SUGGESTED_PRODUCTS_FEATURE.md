# Suggested Products Feature

## Overview
Added a new "Suggested Products" section to the home page that displays recommended products below the Featured Collections section.

## Implementation Details

### Frontend Components
- **SuggestedProducts.jsx**: New component that fetches and displays suggested products
- **HomePage.jsx**: Updated to include the SuggestedProducts component

### Backend API
- **New Endpoint**: `GET /api/products/suggested`
- **Controller**: `getSuggestedProducts` in `controllers/products.js`
- **Route**: Added to `routes/products.js`

### Suggestion Algorithm
The suggested products are ranked using a scoring system based on:
1. **Popular Products** (+10 points): Products marked as `isPopular: true`
2. **Featured Products** (+5 points): Products marked as `isFeatured: true`
3. **High Ratings** (+2x rating): Products with good ratings get bonus points
4. **Review Count** (+3 points): Products with 5+ reviews get additional points

### Features
- **Smart Filtering**: Only shows available products with stock > 0
- **Responsive Design**: Works on all device sizes
- **Loading States**: Shows loading spinner while fetching data
- **Error Handling**: Displays error message with retry option
- **Add to Cart**: Integrated cart functionality
- **Wishlist Integration**: Full wishlist support with authentication checks

### Sample Data
- **Seeding Script**: `backend/scripts/seedProducts.js`
- **NPM Script**: `npm run seed-products` (run from backend directory)
- **Sample Products**: 8 diverse flower products with different ratings and popularity

## Usage

### To Test the Feature:
1. **Seed Sample Data**:
   ```bash
   cd backend
   npm run seed-products
   ```

2. **Start the Application**:
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm run dev
   ```

3. **View the Home Page**: The suggested products will appear below the Featured Collections section

### API Usage:
```javascript
// Fetch suggested products
GET /api/products/suggested?limit=8

// Response format
{
  "status": "success",
  "count": 8,
  "data": {
    "products": [...]
  }
}
```

## Customization
- **Limit**: Change the number of products by modifying the `limit` parameter
- **Scoring**: Adjust the suggestion algorithm in `getSuggestedProducts` controller
- **Styling**: Modify the component styles in `SuggestedProducts.jsx`
- **Position**: Change the position by reordering components in `HomePage.jsx`

## Future Enhancements
- User-based recommendations (based on purchase history)
- Category-based suggestions
- Seasonal product recommendations
- A/B testing for different suggestion algorithms