import { Button } from '../Button';
import { Card } from '../Card';
import { Input } from '../Input';
import { Text } from '../Text';

describe('src/components/ui re-exports', () => {
  it('re-exports Button from src/ui', () => {
    expect(Button).toBeDefined();
  });

  it('re-exports Card from src/ui', () => {
    expect(Card).toBeDefined();
  });

  it('re-exports Input from src/ui', () => {
    expect(Input).toBeDefined();
  });

  it('re-exports Text from src/ui', () => {
    expect(Text).toBeDefined();
  });
});
