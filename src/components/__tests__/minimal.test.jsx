import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Test if we can render a simple component
const SimpleComponent = () => <div>Hello World</div>;

describe('Minimal React Test', () => {
  it('should render a simple component', () => {
    render(<SimpleComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should render with router context', () => {
    render(
      <BrowserRouter>
        <SimpleComponent />
      </BrowserRouter>
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
