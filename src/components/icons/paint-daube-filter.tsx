/**
 * Paint Daube SVG Filter Definition (Web)
 *
 * Creates the organic paint texture effect using feTurbulence.
 * Web-native SVG version replacing react-native-svg imports.
 *
 * Note: This filter is preserved for potential use in custom SVG icons
 * but is no longer required by the Lucide-based PaintDaubeIcon.
 */

export function PaintDaubeFilter({ id, turbulence }: { id: string; turbulence: number }) {
  return (
    <defs>
      <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={0.02 + turbulence * 0.03}
          numOctaves={2}
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={turbulence * 3}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  );
}
