import { renderHook, act } from '@testing-library/react';
import { useAppRouter, useRouteParams, useRouteSegments } from '../use-app-router';

const mockNavigate = vi.fn();
const mockLocation = { pathname: '/onboarding/welcome' };
const mockParams = { id: 'project-1' };

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useParams: () => mockParams,
}));

describe('useAppRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('push navigates to path', () => {
    const { result } = renderHook(() => useAppRouter());
    act(() => {
      result.current.push('/projects');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });

  it('replace navigates with replace option', () => {
    const { result } = renderHook(() => useAppRouter());
    act(() => {
      result.current.replace('/welcome');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/welcome', { replace: true });
  });

  it('back navigates to previous page', () => {
    const { result } = renderHook(() => useAppRouter());
    act(() => {
      result.current.back();
    });
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('exposes navigate function', () => {
    const { result } = renderHook(() => useAppRouter());
    expect(result.current.navigate).toBe(mockNavigate);
  });
});

describe('useRouteParams', () => {
  it('returns typed params', () => {
    const { result } = renderHook(() => useRouteParams<{ id: string }>());
    expect(result.current.id).toBe('project-1');
  });
});

describe('useRouteSegments', () => {
  it('returns pathname segments', () => {
    const { result } = renderHook(() => useRouteSegments());
    expect(result.current).toEqual(['onboarding', 'welcome']);
  });
});
