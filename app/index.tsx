import { ScrollView, View } from 'react-native';
import { Button, Card, Input, Text } from '../src/components/ui';

/**
 * Landing screen component that renders the ThumbCode promotional and demo interface.
 *
 * Renders a scrollable page containing a hero section, key feature cards, a demo "Get Started"
 * card with inputs and action buttons, and a dynamically generated tech stack badge list.
 *
 * @returns The landing page JSX element containing hero, features, demo form, and tech stack.
 */
export default function Index() {
  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="p-6">
        {/* Hero Section */}
        <View className="mb-8">
          <Text variant="display" size="4xl" weight="bold" className="text-coral-500 mb-2">
            ThumbCode
          </Text>
          <Text size="lg" className="text-neutral-600">
            Code with your thumbs. A decentralized multi-agent mobile development platform.
          </Text>
        </View>

        {/* Feature Cards */}
        <View className="mb-6">
          <Text variant="display" size="2xl" weight="semibold" className="mb-4">
            Key Features
          </Text>

          <Card className="mb-4">
            <Text size="lg" weight="semibold" className="mb-2">
              🤖 Multi-Agent Teams
            </Text>
            <Text className="text-neutral-600">
              Architect, Implementer, Reviewer, Tester agents working in parallel
            </Text>
          </Card>

          <Card className="mb-4">
            <Text size="lg" weight="semibold" className="mb-2">
              📱 Mobile-Native Git
            </Text>
            <Text className="text-neutral-600">
              Full git workflow from your phone. Clone, commit, push — powered by isomorphic-git
            </Text>
          </Card>

          <Card className="mb-4">
            <Text size="lg" weight="semibold" className="mb-2">
              🔒 Credential Sovereignty
            </Text>
            <Text className="text-neutral-600">
              Your API keys never leave your device. Stored in secure hardware enclaves
            </Text>
          </Card>
        </View>

        {/* Demo Form */}
        <View className="mb-6">
          <Text variant="display" size="2xl" weight="semibold" className="mb-4">
            Get Started
          </Text>

          <Card variant="elevated">
            <Input label="GitHub Username" placeholder="username" className="mb-4" />
            <Input label="API Key" placeholder="sk-..." secureTextEntry className="mb-4" />
            <Button variant="primary" className="mb-2">
              Connect
            </Button>
            <Button variant="outline">Learn More</Button>
          </Card>
        </View>

        {/* Tech Stack */}
        <View className="mb-8">
          <Text variant="display" size="2xl" weight="semibold" className="mb-4">
            Built With
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {['Expo 52', 'React Native', 'NativeWind', 'Zustand', 'isomorphic-git'].map((tech) => (
              <View
                key={tech}
                className="bg-teal-100 px-3 py-2 rounded-[0.375rem_0.5rem_0.625rem_0.25rem]"
              >
                <Text size="sm" className="text-teal-800">
                  {tech}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
