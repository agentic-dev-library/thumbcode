import { iconMap } from '../icons/iconMap';

describe('iconMap', () => {
  it('maps back to ArrowLeft', () => {
    expect(iconMap.back).toBe('ArrowLeft');
  });

  it('maps alertSuccess to CircleCheck', () => {
    expect(iconMap.alertSuccess).toBe('CircleCheck');
  });

  it('maps alertError to CircleAlert', () => {
    expect(iconMap.alertError).toBe('CircleAlert');
  });

  it('maps alertWarning to TriangleAlert', () => {
    expect(iconMap.alertWarning).toBe('TriangleAlert');
  });

  it('maps alertInfo to Info', () => {
    expect(iconMap.alertInfo).toBe('Info');
  });
});
