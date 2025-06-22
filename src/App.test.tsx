import { render, screen } from '@testing-library/react';
import App from './App';

test('renders budgeting app', () => {
  render(<App />);
  const titleElement = screen.getByText(/budgeting app/i);
  expect(titleElement).toBeInTheDocument();
});
