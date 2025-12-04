# Pachis Menu

A responsive, modern product menu app for Pachis with a beautiful turquoise gradient design.

## Features

- **Responsive Design**: Adapts seamlessly to desktop (3 columns), tablet (2 columns), and mobile (1 column)
- **Dynamic Categories**: Browse between Cartridges, Live Rosin Dabs, Pre-Rolls, and Flower
- **Interactive Product Cards**: Hover effects and smooth animations
- **Bottom Navigation**: Quick access to Home, Categories, Cart, and WhatsApp
- **Clean, Modern UI**: Turquoise gradient background with white cards and glowing effects

## Design

- **Colors**: Turquoise gradient (#00C5D8 → #009FBF)
- **Typography**: Poppins font family
- **Style**: Clean, modern, app-like interface with soft glows and shadows

## Categories

1. **Cartridges** - Liquid Diamonds 2G Cartridges
2. **Live Rosin Dabs** - 2G and 1OZ options
3. **Pre-Rolls** - Premium and Infused options
4. **Flower** - Available in multiple sizes (1/8 OZ, 1/4 OZ, 1/2 OZ, 1 OZ)

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to deploy

### Option 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration
5. Click "Deploy"

## Customization

All design variables are defined at the top of the CSS in the `:root` selector:

```css
:root {
  --pachis-bg-top: #00C5D8;
  --pachis-bg-bottom: #009FBF;
  --pachis-card-bg: #FFFFFF;
  --pachis-card-border: #00B4C7;
  --pachis-text-main: #FFFFFF;
  --pachis-text-accent: #00A1C4;
  --pachis-glow: rgba(0, 197, 216, 0.4);
}
```

## Adding Products

Edit the `products` array in the `<script>` section of `index.html`:

```javascript
const products = [
  {
    id: "unique_id",
    name: "PRODUCT NAME",
    category: "Cartridges", // or "Live Rosin Dabs", "Pre-Rolls", "Flower"
    brand: "Pachis",
    type: "Product description",
    image: "image_url",
    sizes: ["1/8 OZ", "1/4 OZ"] // Optional, for flower category
  }
];
```

## TODO Features

- [ ] Shopping cart functionality
- [ ] WhatsApp integration for orders
- [ ] Product image uploads
- [ ] Admin panel for managing products
- [ ] Multi-language support

## License

© 2024 Pachis. All rights reserved.
