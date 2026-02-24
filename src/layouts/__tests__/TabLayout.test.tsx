import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TabLayout } from '../TabLayout';

describe('TabLayout', () => {
  function renderWithRouter(initialRoute = '/') {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <TabLayout />
      </MemoryRouter>
    );
  }

  it('renders navigation bar with all tab labels', () => {
    renderWithRouter();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders navigation landmark', () => {
    renderWithRouter();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('renders tab links with aria labels', () => {
    renderWithRouter();
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Agents')).toBeInTheDocument();
    expect(screen.getByLabelText('Projects')).toBeInTheDocument();
    expect(screen.getByLabelText('Chat')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });
});
