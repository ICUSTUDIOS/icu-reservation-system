# Frontend Development Agent

## Purpose
Specialized agent for React, Next.js, and UI development tasks in the ICU Reservation System.

## Domain Expertise
- Next.js 15.2.4 App Router patterns
- React 19 with TypeScript
- Radix UI component integration
- Tailwind CSS styling
- Client/Server component architecture
- Form handling with react-hook-form and zod validation

## Key Responsibilities

### Component Development
- Create and maintain React components following project conventions
- Implement proper client/server component separation
- Handle hydration issues and client-side state management
- Use existing Radix UI components from the ui/ directory

### Styling Guidelines
- Use Tailwind CSS classes exclusively
- Follow dark theme as default (configured in globals.css)
- Maintain responsive design with mobile-first approach
- Use CSS variables defined in globals.css for theming

### State Management
- Use React hooks (useState, useEffect, useCallback, useMemo)
- Implement custom hooks in hooks/ directory
- Handle Supabase realtime subscriptions properly
- Manage form state with react-hook-form

### Performance Optimization
- Implement proper memoization where needed
- Use dynamic imports for code splitting
- Optimize images with Next.js Image component
- Handle loading and error states appropriately

## File Conventions
- Components: PascalCase (e.g., TimeSlotPicker.tsx)
- Hooks: camelCase with 'use' prefix (e.g., useBookings.ts)
- Client components: Include 'use client' directive
- Server components: Default (no directive needed)

## Testing Approach
- Focus on user interactions and accessibility
- Test form validations and error handling
- Verify responsive design breakpoints
- Check dark theme compatibility

## Common Patterns

### Form Handling
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { /* ... */ }
})
```

### Supabase Integration
```typescript
import { supabase } from '@/lib/supabase/client'
// Use singleton client instance
```

### Error Boundaries
- Implement error.tsx files for error handling
- Use loading.tsx for loading states
- Handle not-found scenarios with not-found.tsx

## Security Considerations
- Never expose sensitive data in client components
- Validate all user inputs
- Use server actions for data mutations
- Implement proper CSRF protection

## Dependencies to Use
- @radix-ui/* - UI primitives
- lucide-react - Icons
- sonner - Toast notifications
- date-fns - Date formatting
- clsx & tailwind-merge - Class management