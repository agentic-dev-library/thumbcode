import { Button } from '../Button';
import { Card } from '../Card';
import { Input } from '../Input';
import { Text } from '../Text';

describe('src/components/ui re-exports', () => {
  it('re-exports Button from @thumbcode/ui', () => {
    expect(Button).toBeDefined();
  });

  it('re-exports Card from @thumbcode/ui', () => {
    expect(Card).toBeDefined();
  });

  it('re-exports Input from @thumbcode/ui', () => {
    expect(Input).toBeDefined();
  });

  it('re-exports Text from @thumbcode/ui', () => {
    expect(Text).toBeDefined();
  });
});
