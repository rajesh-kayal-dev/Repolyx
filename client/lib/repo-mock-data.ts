import type { ExplorerSection } from './types';

export interface MockRepoActivity {
  type: 'commit' | 'scan' | 'deploy' | 'alert' | 'info';
  title: string;
  detail: string;
  timestamp: string;
}

export interface SuggestedAction {
  title: string;
  answer: string;
}

export interface MockRepo {
  id: string;
  name: string;
  description: string;
  language: string;
  visibility: 'Public' | 'Private';
  lastUpdated: string;
  stack: string;
  branches: string[];
  metrics: {
    files: number;
    dependencies: number;
    apis: number;
    authFlows: number;
  };
  tree: ExplorerSection[];
  summary: string;
  suggestedActions: SuggestedAction[];
  activities: MockRepoActivity[];
}

export const mockRepos: MockRepo[] = [
  {
    id: 'repolyx-frontend',
    name: 'repolyx/frontend',
    description: 'Frontend dashboard and developer workspace built with Next.js.',
    language: 'TypeScript',
    visibility: 'Public',
    lastUpdated: '2h ago',
    stack: 'TypeScript · React · Next.js · Tailwind',
    branches: ['main', 'dev', 'feature/auth-ux'],
    metrics: {
      files: 142,
      dependencies: 28,
      apis: 0,
      authFlows: 1
    },
    tree: [
      {
        title: 'src',
        count: 5,
        items: [
          { path: 'src/app/page.tsx', label: 'app/page.tsx', active: false, tag: 'Analyzed' },
          { path: 'src/app/layout.tsx', label: 'app/layout.tsx', active: false },
          { path: 'src/components/RepoSelector.tsx', label: 'components/RepoSelector.tsx', active: true, tag: 'AI' },
          { path: 'src/components/AIWorkspace.tsx', label: 'components/AIWorkspace.tsx', active: false, tag: 'AI' },
          { path: 'src/lib/utils.ts', label: 'lib/utils.ts', active: false }
        ]
      },
      {
        title: 'public',
        count: 2,
        items: [
          { path: 'public/logo.svg', label: 'logo.svg', active: false },
          { path: 'public/favicon.ico', label: 'favicon.ico', active: false }
        ]
      },
      {
        title: 'config',
        count: 2,
        items: [
          { path: 'tailwind.config.js', label: 'tailwind.config.js', active: false },
          { path: 'tsconfig.json', label: 'tsconfig.json', active: false }
        ]
      }
    ],
    summary: 'This repository is the frontend dashboard of Repolyx, built with Next.js App Router and TailwindCSS. It handles rendering code tree explorers, AI chat interactions, and authentication state management. The layout is optimized for developer workflows with minimal grid layouts.',
    suggestedActions: [
      {
        title: 'Analyze layout structure',
        answer: 'Next.js App Router is configured under `src/app`. Routing structure uses parentheses (e.g. `(app)` and `(auth)`) to group routes for authentication state separation. Layouts inherit CSS configurations from `globals.css` using standard Tailwind styling.'
      },
      {
        title: 'Review rendering performance',
        answer: 'The file explorer component `RepoExplorer.tsx` utilizes React state for collapsing and expanding directories. Transition animations are powered by Framer Motion\'s AnimatePresence. Component rerenders are isolated to keep file search input responsive.'
      },
      {
        title: 'Check build dependencies',
        answer: 'The package.json uses Next.js v14, React v18, Lucide React icons, and Framer Motion. Dependencies are clean without bloated visual frameworks. We recommend upgrading to React v19 once Next.js dependencies are validated.'
      }
    ],
    activities: [
      { type: 'scan', title: 'Repository indexed', detail: '142 files and 28 dependencies mapped', timestamp: '10m ago' },
      { type: 'commit', title: 'Refactored state persistence', detail: 'Synced activeRepoId with localStorage', timestamp: '2h ago' },
      { type: 'info', title: 'Config reconciled', detail: 'tailwind.config.js aligned with styling design tokens', timestamp: '5h ago' }
    ]
  },
  {
    id: 'repolyx-api',
    name: 'repolyx/api',
    description: 'Backend REST API layer containing repository parsing and code intelligence engine.',
    language: 'TypeScript',
    visibility: 'Public',
    lastUpdated: '4h ago',
    stack: 'Node.js · Express · Prisma · PostgreSQL',
    branches: ['main', 'development', 'bugfix/jwt-expiry'],
    metrics: {
      files: 89,
      dependencies: 19,
      apis: 12,
      authFlows: 2
    },
    tree: [
      {
        title: 'src',
        count: 5,
        items: [
          { path: 'src/controllers/auth.controller.ts', label: 'controllers/auth.controller.ts', active: true, tag: 'AI' },
          { path: 'src/routes/api.routes.ts', label: 'routes/api.routes.ts', active: false },
          { path: 'src/middleware/auth.middleware.ts', label: 'middleware/auth.middleware.ts', active: false, tag: 'Analyzed' },
          { path: 'src/services/ai.service.ts', label: 'services/ai.service.ts', active: false, tag: 'AI' },
          { path: 'src/app.ts', label: 'app.ts', active: false }
        ]
      },
      {
        title: 'prisma',
        count: 2,
        items: [
          { path: 'prisma/schema.prisma', label: 'schema.prisma', active: false, tag: 'Analyzed' },
          { path: 'prisma/migrations/', label: 'migrations/...', active: false }
        ]
      },
      {
        title: 'config',
        count: 1,
        items: [
          { path: 'config/db.ts', label: 'db.ts', active: false }
        ]
      }
    ],
    summary: 'This repository contains the backend REST API for Repolyx. It is built using Node.js, Express, and Prisma ORM, and connects to a PostgreSQL database. It handles GitHub OAuth callback sessions, JWT token generation, and triggers code intelligence parsing services.',
    suggestedActions: [
      {
        title: 'Analyze authentication flow',
        answer: 'Authentication flow is implemented in `src/controllers/auth.controller.ts`. It exchanges the GitHub code for an OAuth access token, fetches the user profile, creates/updates the User record in PostgreSQL using Prisma, and signs a JWT token returned to the client in a cookie.'
      },
      {
        title: 'Inspect Prisma schema',
        answer: 'The prisma schema (`prisma/schema.prisma`) defines a clean `User` entity with fields for email, name, avatarUrl, and githubId. Relational indexing is configured on the githubId field for fast lookup during login redirect cycles.'
      },
      {
        title: 'Review API endpoints',
        answer: 'The REST endpoints are defined in `src/routes/api.routes.ts`. Main routes include `/api/auth/github` (login link), `/api/auth/callback` (OAuth callback), and protected data routes `/api/repositories` which use `auth.middleware.ts` for JWT validation.'
      }
    ],
    activities: [
      { type: 'scan', title: 'Repository indexed', detail: '89 files and 19 dependencies mapped', timestamp: '2m ago' },
      { type: 'alert', title: 'Auth flow flagged', detail: 'OAuth callback route requires CSRF state parameter validation', timestamp: '4h ago' },
      { type: 'commit', title: 'Added Prisma User migration', detail: 'Created schema migrations for user data', timestamp: '1d ago' }
    ]
  },
  {
    id: 'portfolio-site',
    name: 'portfolio-site',
    description: 'Lightweight portfolio site built with semantic HTML5 and vanilla JavaScript.',
    language: 'JavaScript',
    visibility: 'Public',
    lastUpdated: '1d ago',
    stack: 'HTML · Vanilla CSS · JavaScript',
    branches: ['main'],
    metrics: {
      files: 12,
      dependencies: 1,
      apis: 0,
      authFlows: 0
    },
    tree: [
      {
        title: 'root',
        count: 3,
        items: [
          { path: 'index.html', label: 'index.html', active: false, tag: 'Analyzed' },
          { path: 'styles.css', label: 'styles.css', active: false },
          { path: 'script.js', label: 'script.js', active: true, tag: 'AI' }
        ]
      },
      {
        title: 'assets',
        count: 2,
        items: [
          { path: 'assets/hero-bg.jpg', label: 'hero-bg.jpg', active: false },
          { path: 'assets/project1.png', label: 'project1.png', active: false }
        ]
      }
    ],
    summary: 'This is a lightweight static portfolio website showcasing personal engineering projects. It is built entirely with semantic HTML5, vanilla CSS grid/flexbox layouts, and custom interactive JavaScript. No bundlers or heavy web frameworks are utilized.',
    suggestedActions: [
      {
        title: 'Analyze interactive features',
        answer: 'The interactive features are configured in `script.js`. It sets up a mobile menu toggle, smooth anchor scroll selectors, and a dark/light mode toggle that updates the root document body class and stores the preference in localStorage.'
      },
      {
        title: 'Review styling structure',
        answer: 'The styling is contained in `styles.css`. It defines CSS custom properties (variables) for theme colors, font families, and animation times. Responsive layout media queries are structured at the end of the stylesheet.'
      },
      {
        title: 'Optimize asset loading',
        answer: 'The site relies on local image assets under `assets/`. We recommend compressing `hero-bg.jpg` into WebP format and setting lazy-loading attributes on non-critical images to improve the LCP (Largest Contentful Paint) score.'
      }
    ],
    activities: [
      { type: 'scan', title: 'Repository indexed', detail: '12 files and 1 dependency mapped', timestamp: '15m ago' },
      { type: 'commit', title: 'Updated contact section', detail: 'Added active social links and email form action', timestamp: '1d ago' }
    ]
  },
  {
    id: 'e-commerce-backend',
    name: 'e-commerce-backend',
    description: 'High-performance Go backend supporting catalog searching and cart operations.',
    language: 'Go',
    visibility: 'Public',
    lastUpdated: '3d ago',
    stack: 'Go · Gin · Redis · PostgreSQL',
    branches: ['main', 'release-v1'],
    metrics: {
      files: 112,
      dependencies: 45,
      apis: 24,
      authFlows: 1
    },
    tree: [
      {
        title: 'cmd',
        count: 1,
        items: [
          { path: 'cmd/server/main.go', label: 'server/main.go', active: false }
        ]
      },
      {
        title: 'internal',
        count: 3,
        items: [
          { path: 'internal/auth/jwt.go', label: 'auth/jwt.go', active: true, tag: 'AI' },
          { path: 'internal/db/postgres.go', label: 'db/postgres.go', active: false },
          { path: 'internal/handlers/cart.go', label: 'handlers/cart.go', active: false, tag: 'Analyzed' }
        ]
      },
      {
        title: 'config',
        count: 2,
        items: [
          { path: 'go.mod', label: 'go.mod', active: false },
          { path: 'docker-compose.yml', label: 'docker-compose.yml', active: false }
        ]
      }
    ],
    summary: 'This repository is a high-performance e-commerce API built in Go using the Gin web framework. It implements session caching using Redis, relational data storage via PostgreSQL, and structured JWT auth routines. The architecture follows clean Go design principles.',
    suggestedActions: [
      {
        title: 'Analyze concurrency safety',
        answer: 'The server handles HTTP handlers concurrently. Database connections are managed by connection pool boundaries configured in `postgres.go` to prevent leak issues. Caching operations check Redis keys using atomic pipeline commands.'
      },
      {
        title: 'Review database indexes',
        answer: 'Relational schemas are managed through migration scripts. Frequently queried tables, including `products` and `orders`, have composite indexes on fields like category, status, and price to speed up page lookups.'
      },
      {
        title: 'Verify Docker setup',
        answer: '`docker-compose.yml` spins up Go application binaries alongside local instances of PostgreSQL and Redis. Environment variables are injected from local environment bindings to separate config from logic.'
      }
    ],
    activities: [
      { type: 'scan', title: 'Repository indexed', detail: '112 files and 45 dependencies mapped', timestamp: 'Just now' },
      { type: 'info', title: 'Connection pool test', detail: 'PostgreSQL max connections set to 50 under load', timestamp: '2d ago' },
      { type: 'commit', title: 'Implemented Redis caching', detail: 'Added cache layer for product search results', timestamp: '3d ago' }
    ]
  },
  {
    id: 'ml-data-processor',
    name: 'ml-data-processor',
    description: 'Python processing utility for model loading and asynchronous tensor evaluation.',
    language: 'Python',
    visibility: 'Private',
    lastUpdated: '5d ago',
    stack: 'Python · PyTorch · FastAPI · Docker',
    branches: ['main', 'experiment-conv2d'],
    metrics: {
      files: 67,
      dependencies: 34,
      apis: 5,
      authFlows: 0
    },
    tree: [
      {
        title: 'app',
        count: 3,
        items: [
          { path: 'app/main.py', label: 'main.py', active: false },
          { path: 'app/model.py', label: 'model.py', active: true, tag: 'AI' },
          { path: 'app/dataset.py', label: 'dataset.py', active: false, tag: 'Analyzed' }
        ]
      },
      {
        title: 'tests',
        count: 1,
        items: [
          { path: 'test_model.py', label: 'test_model.py', active: false }
        ]
      },
      {
        title: 'config',
        count: 2,
        items: [
          { path: 'requirements.txt', label: 'requirements.txt', active: false },
          { path: 'Dockerfile', label: 'Dockerfile', active: false }
        ]
      }
    ],
    summary: 'This repository hosts a machine learning inference and data processing backend. It is built in Python using PyTorch for tensor operations and deep learning models, and wraps model inference inside a fast, asynchronous FastAPI REST gateway.',
    suggestedActions: [
      {
        title: 'Explain model structure',
        answer: 'The model is loaded in `app/model.py`. It inherits from `torch.nn.Module` and implements a deep convolutional network. Weight files are pulled dynamically from external model registries at initialization.'
      },
      {
        title: 'Analyze dataset processing',
        answer: 'Data pre-processing is configured in `app/dataset.py`. It reads raw tensors, normalizes input channels, and applies random scaling augmentation steps. Performance is boosted using PyTorch\'s DataLoader multiprocessing.'
      },
      {
        title: 'Inspect API boundaries',
        answer: 'FastAPI exposes `/predict` and `/health` endpoints in `app/main.py`. The prediction endpoint accepts image uploads, transforms inputs to float tensors, runs inference inside a torch.no_grad() block, and returns class scores.'
      }
    ],
    activities: [
      { type: 'scan', title: 'Repository indexed', detail: '67 files and 34 dependencies mapped', timestamp: '2h ago' },
      { type: 'commit', title: 'Docker multi-stage build', detail: 'Reduced image size by splitting builder and runtime layers', timestamp: '5d ago' }
    ]
  }
];
