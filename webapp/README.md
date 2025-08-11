# Poker Trainer Application

A modern React-based poker training application for studying and practicing preflop ranges.

## Features

- **Study Mode**: View and learn poker ranges for different positions
- **Test Mode**: Test your knowledge with interactive range selection
- **Hand Practice**: Practice with random hands across multiple ranges
- **Range Management**: Create, edit, and manage custom ranges
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Pattern & Grid Views**: Choose between different visualization layouts

## Technology Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Mantine** - Component library for consistent UI
- **CSS Variables** - Custom design system
- **LocalStorage** - Persistent data storage

## Getting Started

### Prerequisites

- Node.js (v22.8.0 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the webapp directory:
   ```bash
   cd webapp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Navigation/     # Navigation components
│   ├── RangeGrid/      # Range visualization components
│   ├── Modes/          # Mode-specific components
│   └── Common/         # Shared components
├── hooks/              # Custom React hooks
├── data/               # Static data (default ranges)
├── utils/              # Utility functions
└── styles/             # CSS files
```

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Vite configuration
3. Deploy with the default settings

The `vercel.json` configuration handles:
- SPA routing
- Asset caching
- Build optimization

## Range Data Structure

Ranges are stored in a hierarchical structure:
- Categories (e.g., "Open Raises", "vs. 3-bet")
- Situations (e.g., "LJ", "HJ vs CO 3-bet")
- Actions (raise, call, fold)

## Contributing

1. Follow the existing code structure
2. Use functional components with hooks
3. Leverage Mantine components where possible
4. Maintain responsive design principles
5. Test on both desktop and mobile

## License

Private project - All rights reserved.