import { fireEvent, render, screen } from '@testing-library/react';
import { Box } from '../primitives/Box';
import { Button } from '../primitives/Button';
import { Image } from '../primitives/Image';
import { List } from '../primitives/List';
import { ScrollArea } from '../primitives/ScrollArea';
import { Switch } from '../primitives/Switch';
import { TextInput } from '../primitives/TextInput';

describe('Box', () => {
  it('renders children', () => {
    render(<Box>Content</Box>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Box className="my-class">Text</Box>);
    expect(container.querySelector('.my-class')).toBeInTheDocument();
  });

  it('maps testID to data-testid', () => {
    render(<Box testID="box-1">Text</Box>);
    expect(screen.getByTestId('box-1')).toBeInTheDocument();
  });

  it('handles onClick and adds button role', () => {
    const onClick = vi.fn();
    render(
      <Box onClick={onClick} testID="clickable">
        Click me
      </Box>
    );
    const el = screen.getByTestId('clickable');
    expect(el).toHaveAttribute('role', 'button');
    expect(el).toHaveAttribute('tabIndex', '0');
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('handles keyboard Enter for onClick', () => {
    const onClick = vi.fn();
    render(
      <Box onClick={onClick} testID="keyboard">
        Text
      </Box>
    );
    fireEvent.keyDown(screen.getByTestId('keyboard'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('handles keyboard Space for onClick', () => {
    const onClick = vi.fn();
    render(
      <Box onClick={onClick} testID="keyboard">
        Text
      </Box>
    );
    fireEvent.keyDown(screen.getByTestId('keyboard'), { key: ' ' });
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click</Button>);
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  it('handles onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('handles legacy onPress', () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Press</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('applies disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('maps accessibility props to aria attributes', () => {
    render(
      <Button
        accessibilityLabel="Save"
        accessibilityHint="Saves the form"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: true }}
      >
        Save
      </Button>
    );
    const btn = screen.getByRole('checkbox');
    expect(btn).toHaveAttribute('aria-label', 'Save');
    expect(btn).toHaveAttribute('aria-description', 'Saves the form');
    expect(btn).toHaveAttribute('aria-checked', 'true');
  });

  it('maps testID to data-testid', () => {
    render(<Button testID="btn-1">Test</Button>);
    expect(screen.getByTestId('btn-1')).toBeInTheDocument();
  });
});

describe('Image', () => {
  it('renders image with src and alt', () => {
    render(<Image src="https://example.com/img.png" alt="Test image" />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('src', 'https://example.com/img.png');
  });

  it('applies dimensions', () => {
    render(<Image src="img.png" alt="test" width={100} height={50} />);
    const img = screen.getByAltText('test');
    expect(img).toHaveAttribute('width', '100');
    expect(img).toHaveAttribute('height', '50');
  });

  it('defaults to lazy loading', () => {
    render(<Image src="img.png" alt="test" />);
    expect(screen.getByAltText('test')).toHaveAttribute('loading', 'lazy');
  });
});

describe('List', () => {
  const items = ['Apple', 'Banana', 'Cherry'];

  it('renders items', () => {
    render(
      <List
        data={items}
        renderItem={({ item }) => <span>{item}</span>}
        keyExtractor={(item) => item}
      />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('renders empty component when data is empty', () => {
    render(
      <List
        data={[]}
        renderItem={({ item }) => <span>{item}</span>}
        keyExtractor={(item) => String(item)}
        ListEmptyComponent={<span>No items</span>}
      />
    );
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('renders header and footer', () => {
    render(
      <List
        data={items}
        renderItem={({ item }) => <span>{item}</span>}
        keyExtractor={(item) => item}
        ListHeaderComponent={<span>Header</span>}
        ListFooterComponent={<span>Footer</span>}
      />
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders item separators', () => {
    render(
      <List
        data={items}
        renderItem={({ item }) => <span>{item}</span>}
        keyExtractor={(item) => item}
        ItemSeparatorComponent={() => <hr data-testid="separator" />}
      />
    );
    expect(screen.getAllByTestId('separator')).toHaveLength(2);
  });
});

describe('ScrollArea', () => {
  it('renders children', () => {
    render(<ScrollArea>Scrollable content</ScrollArea>);
    expect(screen.getByText('Scrollable content')).toBeInTheDocument();
  });

  it('applies overflow-auto class', () => {
    const { container } = render(<ScrollArea>Content</ScrollArea>);
    expect(container.querySelector('.overflow-auto')).toBeInTheDocument();
  });

  it('maps testID to data-testid', () => {
    render(<ScrollArea testID="scroll-1">Content</ScrollArea>);
    expect(screen.getByTestId('scroll-1')).toBeInTheDocument();
  });
});

describe('Switch', () => {
  it('renders a checkbox input', () => {
    render(<Switch value={false} onValueChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('reflects checked state', () => {
    render(<Switch value={true} onValueChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('calls onValueChange with toggled value', () => {
    const onValueChange = vi.fn();
    render(<Switch value={false} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('applies disabled state', () => {
    render(<Switch value={false} onValueChange={vi.fn()} disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('applies accessibility label', () => {
    render(<Switch value={false} onValueChange={vi.fn()} accessibilityLabel="Toggle dark mode" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Toggle dark mode');
  });
});

describe('TextInput', () => {
  it('renders with placeholder', () => {
    render(<TextInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('calls onChangeText with new value', () => {
    const onChangeText = vi.fn();
    render(<TextInput onChangeText={onChangeText} placeholder="type" />);
    fireEvent.change(screen.getByPlaceholderText('type'), {
      target: { value: 'hello' },
    });
    expect(onChangeText).toHaveBeenCalledWith('hello');
  });

  it('sets type to password when secureTextEntry', () => {
    render(<TextInput secureTextEntry placeholder="password" />);
    expect(screen.getByPlaceholderText('password')).toHaveAttribute('type', 'password');
  });

  it('disables input when editable is false', () => {
    render(<TextInput editable={false} placeholder="readonly" />);
    expect(screen.getByPlaceholderText('readonly')).toBeDisabled();
  });

  it('calls onSubmitEditing on Enter key', () => {
    const onSubmit = vi.fn();
    render(<TextInput onSubmitEditing={onSubmit} placeholder="submit" />);
    fireEvent.keyDown(screen.getByPlaceholderText('submit'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('maps accessibilityLabel to aria-label', () => {
    render(<TextInput accessibilityLabel="Search" placeholder="search" />);
    expect(screen.getByPlaceholderText('search')).toHaveAttribute('aria-label', 'Search');
  });
});
