import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Input, Text } from '@/components/ui';
import { getColor } from '@/utils/design-tokens';

/**
 * Component verification screen.
 * Demonstrates the core UI components from the design system.
 */
const VerificationScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="display" size="2xl" weight="semibold" className="mb-4">
          Component Verification
        </Text>

        <Card className="mb-4">
          <Text size="lg" weight="semibold" className="mb-2">
            Button Component
          </Text>
          <Button variant="primary" className="mb-2">
            Primary Button
          </Button>
          <Button variant="outline">Outline Button</Button>
        </Card>

        <Card className="mb-4">
          <Text size="lg" weight="semibold" className="mb-2">
            Input Component
          </Text>
          <Input label="Text Input" placeholder="Enter text here" className="mb-2" />
          <Input label="Secure Input" placeholder="Password" secureTextEntry />
        </Card>

        <Card className="mb-4">
          <Text size="lg" weight="semibold" className="mb-2">
            Text Variants
          </Text>
          <Text variant="display" size="xl" className="text-coral-500 mb-1">
            Display Text
          </Text>
          <Text variant="body" className="text-neutral-600">
            Body text for paragraphs and content.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('neutral', '50'),
  },
  content: {
    padding: 16,
  },
});

export default VerificationScreen;
