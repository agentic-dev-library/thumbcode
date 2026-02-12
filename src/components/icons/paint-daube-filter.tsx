/**
 * Paint Daube SVG Filter Definition
 *
 * Creates the organic paint texture effect using feTurbulence
 * for ThumbCode's brand icon system.
 */

import { Defs, FeDisplacementMap, FeTurbulence, Filter } from 'react-native-svg';

export function PaintDaubeFilter({ id, turbulence }: { id: string; turbulence: number }) {
  return (
    <Defs>
      <Filter id={id} x="-20%" y="-20%" width="140%" height="140%">
        <FeTurbulence
          type="fractalNoise"
          baseFrequency={0.02 + turbulence * 0.03}
          numOctaves={2}
          result="noise"
        />
        <FeDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={turbulence * 3}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </Filter>
    </Defs>
  );
}
