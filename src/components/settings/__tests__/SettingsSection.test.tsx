import { render, screen } from '@testing-library/react';
import { SettingsSection } from '../SettingsSection';

vi.mock('@/components/layout', () => ({
  VStack: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children }: any) => <span>{children}</span>,
}));

describe('SettingsSection', () => {
  it('renders title', () => {
    render(
      <SettingsSection title="General">
        <div>Content</div>
      </SettingsSection>
    );
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <SettingsSection title="General">
        <div>Child content</div>
      </SettingsSection>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SettingsSection title="Custom" className="my-custom-class">
        <div>Content</div>
      </SettingsSection>
    );
    expect(container.querySelector('.my-custom-class')).toBeInTheDocument();
  });
});
