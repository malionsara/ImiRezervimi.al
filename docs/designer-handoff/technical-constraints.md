# Technical Constraints - Designer Handoff

This document outlines the technical constraints and requirements for the ImiRezervimi.al application design implementation.

## Framework & Technology Stack

### Frontend Framework
- **Next.js 15.3.5**: React-based framework with SSR/SSG capabilities
- **React 19.0.0**: Component-based UI library
- **TypeScript**: Type-safe JavaScript development
- **Node.js**: Runtime environment

### Styling & UI
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **@tailwindcss/forms**: Form styling plugin
- **@tailwindcss/typography**: Typography plugin
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

### State Management & Data
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **NextAuth.js**: Authentication
- **Supabase**: Database and real-time features
- **@supabase/supabase-js**: Supabase client library

### Testing & Quality
- **Playwright**: End-to-end testing
- **Jest**: Unit testing
- **ESLint**: Code linting
- **TypeScript**: Type checking

## Design System Constraints

### Color Palette
- **Primary Colors**: Red/Pink gradient theme
- **Current Brand Colors**:
  - Red: `#EF4444` (red-500)
  - Pink: `#EC4899` (pink-500)
  - Gray: Various shades for text and backgrounds
- **Accessibility**: Must meet WCAG 2.1 AA contrast ratios

### Typography
- **Font System**: Tailwind's default font stack
- **Headings**: Responsive font sizes
- **Body Text**: Minimum 16px for mobile readability
- **Albanian Language**: Support for Albanian characters and text

### Spacing & Layout
- **Grid System**: CSS Grid and Flexbox
- **Spacing Scale**: Tailwind's spacing scale (4px base unit)
- **Container Widths**: Responsive containers with max-widths
- **Breakpoints**: 
  - Mobile: 375px (iPhone SE)
  - Tablet: 768px (iPad)
  - Desktop: 1920px (Full HD)

### Component Constraints
- **Button Sizes**: Minimum 44x44px touch targets
- **Form Elements**: Consistent styling with Tailwind Forms
- **Cards**: Rounded corners, shadows, borders
- **Modals**: Responsive modal system
- **Navigation**: Mobile-first navigation patterns

## Responsive Design Requirements

### Mobile-First Approach
- **Design Priority**: Mobile viewport first, then scale up
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Viewport Meta**: Proper viewport configuration
- **Touch Gestures**: Support for swipe, pinch, tap

### Breakpoint Strategy
```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Viewport Testing
- **iPhone SE**: 375x667 (Primary mobile target)
- **iPhone 12 Pro**: 390x844
- **iPad**: 768x1024 (Primary tablet target)
- **Desktop**: 1920x1080 (Primary desktop target)

## Performance Requirements

### Loading Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Image Optimization
- **Next.js Image Component**: Automatic optimization
- **WebP Format**: Preferred for modern browsers
- **Lazy Loading**: Images below the fold
- **Responsive Images**: Different sizes for different viewports

### Bundle Size
- **JavaScript Bundle**: < 250KB gzipped
- **CSS Bundle**: < 50KB gzipped
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Lazy load non-critical components

## Browser Support

### Supported Browsers
- **Chrome**: Last 2 versions
- **Firefox**: Last 2 versions
- **Safari**: Last 2 versions
- **Edge**: Last 2 versions
- **Mobile Safari**: iOS 14+
- **Chrome Mobile**: Android 8+

### Feature Support
- **CSS Grid**: Full support required
- **Flexbox**: Full support required
- **CSS Custom Properties**: Full support required
- **ES6+ JavaScript**: Transpiled for older browsers

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and structure
- **Focus Management**: Clear focus indicators

### Semantic HTML
- **Proper Heading Structure**: H1-H6 hierarchy
- **Form Labels**: All form inputs must have labels
- **Alt Text**: All images must have alt text
- **Landmark Elements**: Proper use of main, nav, aside, etc.

### Interactive Elements
- **Touch Targets**: Minimum 44x44px
- **Focus States**: Visible focus indicators
- **Hover States**: Appropriate hover feedback
- **Loading States**: Clear loading indicators

## Data & API Constraints

### Authentication
- **NextAuth.js**: OAuth providers (Instagram, Google)
- **Session Management**: Secure cookie-based sessions
- **User Roles**: Customer, Salon Owner, Admin
- **Permission System**: Role-based access control

### Real-time Features
- **Supabase Realtime**: Live updates for appointments
- **WebSocket Connections**: Efficient real-time communication
- **Offline Support**: Basic offline functionality
- **Sync on Reconnect**: Data synchronization

### Form Validation
- **Client-side**: Zod schema validation
- **Server-side**: API endpoint validation
- **Error Handling**: User-friendly error messages
- **Success States**: Clear success feedback

## Mobile-Specific Constraints

### Touch Interface
- **Touch Targets**: Minimum 44x44px
- **Touch Gestures**: Swipe, tap, pinch support
- **On-screen Keyboard**: Proper form handling
- **Scroll Behavior**: Smooth scrolling, pull-to-refresh

### Performance
- **60fps Animations**: Smooth animations and transitions
- **Battery Optimization**: Efficient rendering
- **Memory Usage**: Optimized for mobile devices
- **Network Efficiency**: Minimal data usage

### Platform Considerations
- **iOS Safari**: Specific considerations for iOS
- **Android Chrome**: Android-specific optimizations
- **PWA Support**: Progressive Web App capabilities
- **App-like Experience**: Native app-like feel

## Security Constraints

### Data Protection
- **HTTPS Only**: All communication encrypted
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: Cross-site request forgery prevention
- **SQL Injection**: Parameterized queries

### Authentication Security
- **OAuth 2.0**: Secure authentication flow
- **Session Security**: Secure session management
- **Token Management**: Secure token handling
- **Password Security**: Strong password requirements

## Deployment Constraints

### Hosting Platform
- **Vercel**: Primary deployment platform
- **Edge Functions**: Serverless functions
- **CDN**: Global content delivery
- **Environment Variables**: Secure configuration

### Build Process
- **Next.js Build**: Optimized production build
- **Static Generation**: Pre-rendered pages where possible
- **Image Optimization**: Automatic image optimization
- **Bundle Analysis**: Bundle size monitoring

## Design Implementation Guidelines

### Component Development
- **Reusable Components**: Create reusable UI components
- **Props Interface**: TypeScript interfaces for props
- **Default Props**: Sensible defaults for all props
- **Error Boundaries**: Graceful error handling

### Styling Approach
- **Utility-First**: Use Tailwind utility classes
- **Custom CSS**: Minimal custom CSS when needed
- **CSS Modules**: Component-scoped styles
- **Responsive Design**: Mobile-first responsive design

### State Management
- **Local State**: React hooks for component state
- **Global State**: Context API for global state
- **Form State**: React Hook Form for forms
- **Server State**: SWR or React Query for server data

## Testing Requirements

### Automated Testing
- **Unit Tests**: Jest for component testing
- **Integration Tests**: Playwright for E2E testing
- **Visual Regression**: Screenshot testing
- **Accessibility Testing**: Automated a11y testing

### Manual Testing
- **Cross-browser Testing**: All supported browsers
- **Device Testing**: Real device testing
- **User Testing**: Usability testing
- **Performance Testing**: Load and performance testing

## Maintenance Considerations

### Code Organization
- **Component Structure**: Clear component hierarchy
- **File Naming**: Consistent naming conventions
- **Documentation**: Inline code documentation
- **TypeScript**: Type safety throughout

### Update Strategy
- **Dependency Updates**: Regular dependency updates
- **Security Patches**: Immediate security updates
- **Feature Updates**: Planned feature releases
- **Breaking Changes**: Careful handling of breaking changes

## Performance Monitoring

### Metrics Tracking
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **User Experience**: Real user monitoring
- **Error Tracking**: Error monitoring and alerting
- **Performance Budget**: Performance budget enforcement

### Optimization
- **Bundle Analysis**: Regular bundle size analysis
- **Image Optimization**: Continuous image optimization
- **Code Splitting**: Strategic code splitting
- **Caching Strategy**: Effective caching implementation
