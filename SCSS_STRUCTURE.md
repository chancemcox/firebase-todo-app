# TaskFlow SCSS Structure

This document outlines the SCSS architecture and organization for the TaskFlow application.

## Overview

The application has been converted from plain CSS to SCSS (Sass) for better organization, maintainability, and developer experience. SCSS provides:

- **Variables**: Centralized color schemes, spacing, and design tokens
- **Mixins**: Reusable design patterns and utilities
- **Nesting**: Better organization and readability
- **Modular imports**: Organized component-based structure

## File Structure

```
resources/css/
├── app.scss                 # Main SCSS file with imports and global styles
├── components/              # Component-specific styles
│   ├── _buttons.scss       # Button components and variants
│   └── _forms.scss         # Form elements and validation
└── utilities/               # Utility classes and animations
    └── _animations.scss    # Animation keyframes and classes
```

## Main SCSS File (`app.scss`)

### Imports
- **Tailwind CSS**: Base, components, and utilities
- **Components**: Button and form styles
- **Utilities**: Animation and transition utilities

### Variables
All design tokens are centralized at the top of the file:

```scss
// Color palette
$primary-blue: #3b82f6;
$primary-purple: #8b5cf6;
$primary-green: #10b981;
// ... more colors

// Spacing scale
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
// ... more spacing

// Border radius
$radius-sm: 0.375rem;
$radius-lg: 0.75rem;
$radius-xl: 1rem;
// ... more radius values

// Shadows
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
// ... more shadows

// Transitions
$transition-fast: 150ms ease-in-out;
$transition-normal: 200ms ease-in-out;
$transition-slow: 300ms ease-in-out;
```

### Mixins
Reusable design patterns:

```scss
// Glassmorphism effect
@mixin glassmorphism($bg-opacity: 0.8, $border-opacity: 0.5) {
  background: rgba(255, 255, 255, $bg-opacity);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(229, 231, 235, $border-opacity);
}

// Gradient text
@mixin gradient-text($gradient) {
  background: $gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// Hover effects
@mixin hover-lift($distance: 0.125rem) {
  transition: transform $transition-normal, box-shadow $transition-normal;
  
  &:hover {
    transform: translateY(-$distance);
    box-shadow: $shadow-xl;
  }
}

@mixin hover-scale($scale: 1.05) {
  transition: transform $transition-normal;
  
  &:hover {
    transform: scale($scale);
  }
}
```

## Component Styles

### Buttons (`_buttons.scss`)
Comprehensive button system with multiple variants:

```scss
.btn {
  // Base button styles
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md $spacing-xl;
  border-radius: $radius-xl;
  font-weight: 600;
  transition: all $transition-normal;
  
  // Variants
  &-primary {
    background: $gradient-blue-purple;
    color: white;
    box-shadow: $shadow-lg;
    
    &:hover {
      background: linear-gradient(135deg, darken($primary-blue, 10%) 0%, darken($primary-purple, 10%) 100%);
      box-shadow: $shadow-xl;
      @include hover-lift;
    }
  }
  
  &-secondary {
    @include glassmorphism;
    color: $gray-700;
  }
  
  &-success {
    background: $gradient-green-emerald;
    color: white;
  }
  
  &-danger {
    background: $primary-red;
    color: white;
  }
  
  // Sizes
  &-sm { /* small button styles */ }
  &-lg { /* large button styles */ }
  &-xl { /* extra large button styles */ }
  
  // States
  &.loading { /* loading state */ }
  &:disabled { /* disabled state */ }
}
```

### Forms (`_forms.scss`)
Enhanced form styling with validation states:

```scss
.form-group {
  margin-bottom: $spacing-lg;
  position: relative;
  
  &.has-error {
    .form-control {
      border-color: $primary-red;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .form-error {
      display: block;
      color: $primary-red;
    }
  }
  
  &.has-success {
    .form-control {
      border-color: $primary-green;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
  }
}

.form-control {
  width: 100%;
  padding: $spacing-md $spacing-lg;
  border: 2px solid $gray-300;
  border-radius: $radius-xl;
  transition: all $transition-normal;
  
  &:focus {
    outline: none;
    border-color: $primary-blue;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: $gray-400;
    box-shadow: $shadow-md;
  }
}
```

## Utility Classes

### Animations (`_animations.scss`)
Comprehensive animation system:

```scss
// Fade animations
.animate-fade-in { animation-name: fadeIn; }
.animate-fade-in-up { animation-name: fadeInUp; }
.animate-fade-in-down { animation-name: fadeInDown; }

// Scale animations
.animate-scale-in { animation-name: scaleIn; }
.animate-scale-out { animation-name: scaleOut; }

// Hover effects
.hover-lift { @include hover-lift; }
.hover-scale { @include hover-scale; }
.hover-rotate { /* rotation on hover */ }
.hover-glow { /* glow effect on hover */ }

// Stagger animations
.stagger-children > * {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
// ... up to 10 children
```

## Usage Examples

### Using Variables
```scss
.my-component {
  color: $primary-blue;
  padding: $spacing-lg;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
}
```

### Using Mixins
```scss
.glass-card {
  @include glassmorphism(0.9, 0.3);
  @include hover-lift;
}

.gradient-title {
  @include gradient-text($gradient-blue-purple);
}
```

### Component Classes
```html
<!-- Button variants -->
<button class="btn btn-primary btn-lg">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-success">Success Button</button>

<!-- Form with validation -->
<div class="form-group has-error">
  <label class="form-label">Email</label>
  <input type="email" class="form-control" placeholder="Enter email">
  <div class="form-error">Please enter a valid email address</div>
</div>

<!-- Animated elements -->
<div class="animate-fade-in-up">Fade in from bottom</div>
<div class="hover-lift">Lift on hover</div>
<div class="stagger-children">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Best Practices

1. **Use Variables**: Always use SCSS variables instead of hardcoded values
2. **Leverage Mixins**: Use mixins for repeated patterns
3. **Component Organization**: Keep related styles together in component files
4. **Responsive Design**: Use the provided responsive utilities
5. **Accessibility**: Include focus states and reduced motion preferences

## Browser Support

The SCSS includes vendor prefixes for:
- `-webkit-backdrop-filter` (Safari)
- `-webkit-user-select` (Safari)
- All modern CSS properties

## Build Process

The SCSS is compiled using Vite with the following process:
1. SCSS files are processed by Sass compiler
2. Tailwind CSS is imported and processed
3. All styles are bundled into a single CSS file
4. Vendor prefixes are automatically added where needed

## Future Improvements

- Convert `@import` to `@use` (Sass 3.0+)
- Replace deprecated `darken()` functions with `color.adjust()`
- Add more component modules (cards, navigation, etc.)
- Implement CSS custom properties for dynamic theming
