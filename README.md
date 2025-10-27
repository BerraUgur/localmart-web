# Localmart
Localmart is a feature-rich Angular/Ionic-based e-commerce platform designed for seamless shopping experiences. This project includes product management, user authentication, and order tracking, making it ideal for small to medium-sized businesses.

## Features

### User Authentication
- Secure login and registration
- Forgot Password functionality with email-based password reset
- Reset Password page for updating user credentials

### Product Management
- Add, update, and delete products
- View detailed product information
- Manage product images and descriptions

### Shopping Basket
- Add products to the basket
- View and manage items in the basket
- Proceed to checkout

### Order Tracking
- View order history
- Track the status of current orders

### User Management
- Admin panel for managing users
- Update user information

### Notifications
- Real-time notifications using Toastr for user actions

## Development Setup

### Prerequisites
- Node.js and npm installed
- Angular CLI installed globally
- Docker (for backend and database)
- DBeaver (for database management)

## Project Structure
```
src/
├── app/
│   ├── components/          # Angular components (product, basket, login, etc.)
│   ├── models/              # TypeScript models (Product, User, etc.)
│   ├── services/            # Services for API calls, logging, authentication
│   ├── app.config.ts        # App configuration
│   ├── app.routes.ts        # Routing configuration
│   ├── app.component.ts     # Root component
├── assets/                  # Static assets (images, etc.)
├── index.html               # Main HTML file
├── main.ts                  # App bootstrap
├── styles.css               # Global styles
```
- **components/**: UI components for product, basket, login, etc.
- **models/**: TypeScript interfaces for app data.
- **services/**: API communication, logging, authentication.
- **app.config.ts**: App configuration.
- **assets/**: Images and static files.

### Installation
1. Clone the repository:
   ```bash
git clone https://github.com/BerraUgur/localmart-web.git
```
2. Navigate to the project directory:
   ```bash
cd localmart-web
```
3. Install dependencies:
   ```bash
npm install
```

### Running the Application
1. Start the development server:
   ```bash
ng serve
```
2. Open your browser and navigate to:
   ```
http://localhost:4200/
```

### Backend & Database
- The backend API can be run using Docker for easy setup and isolation.
- Database management and inspection is made simple with DBeaver.
- These tools help streamline development and debugging.

### Building the Application
Run the following command to build the project:
```bash
ng build
```
The build artifacts will be stored in the `dist/` directory.

### Testing
#### Unit Tests
Run the following command to execute unit tests:
```bash
ng test
```

## Technologies Used
- Angular
- Ionic
- TypeScript
- RxJS
- Bootstrap
- Toastr
- Docker
- DBeaver

## Contribution
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.