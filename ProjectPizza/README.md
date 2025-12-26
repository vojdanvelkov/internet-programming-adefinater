# 🍕 Pizza Palace

A professional Angular 20 pizza ordering application with user authentication, custom pizza builder, shopping cart, and order tracking.

## Features

- **Menu Page** - Browse 12 delicious pizzas with images, filtering, sorting, and favorites
- **Custom Pizza Builder** - Drag & drop toppings to create your own pizza (max 6 toppings)
- **Shopping Cart** - Add pizzas, adjust quantities (max 10 pizzas, 6 of same type), priority ordering
- **Order Tracking** - Track your order status with real-time updates
- **User Authentication** - Sign up/login with user-specific cart and favorites
- **Responsive Design** - Works on desktop and mobile devices

## Prerequisites

Before running this project, make sure you have installed:

- **Node.js** (version 18.x or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

To verify installation, run:
```bash
node --version
npm --version
```

## Installation & Running

1. **Clone the repository**
   ```bash
   git clone https://github.com/vojdanvelkov/internet-programming-adefinater.git
   ```

2. **Navigate to the project folder**
   ```bash
   cd internet-programming-adefinater/ProjectPizza
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:4200
   ```

## Project Structure

```
src/
├── app/
│   ├── features/
│   │   ├── menu/          # Pizza menu page
│   │   ├── builder/       # Custom pizza builder
│   │   ├── cart/          # Shopping cart & checkout
│   │   ├── orders/        # Order tracking
│   │   └── auth/          # Login/Signup
│   ├── services/
│   │   ├── api.service.ts      # API calls
│   │   ├── cart.service.ts     # Cart management
│   │   ├── auth.service.ts     # Authentication
│   │   └── favorites.service.ts # Favorites management
│   ├── guards/
│   │   └── auth.guard.ts       # Route protection
│   └── models/
│       └── pizza.model.ts      # Data interfaces
├── assets/
│   └── pizzas/            # Pizza images
└── styles.css             # Global styles
```

## Technologies Used

- **Angular 20** - Frontend framework
- **TypeScript** - Programming language
- **RxJS** - Reactive programming
- **CSS3** - Styling with custom properties
- **LocalStorage** - Data persistence

## API

The app uses the Fast React Pizza API for menu data and order submission:
- Base URL: `https://react-fast-pizza-api.onrender.com/api`

## Author

Vojdan Velkov - Internet Programming Course Project
