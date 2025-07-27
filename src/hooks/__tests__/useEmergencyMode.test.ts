import { renderHook, act } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useEmergencyMode } from '../useEmergencyMode';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

describe('useEmergencyMode Hook', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('returns emergency mode state', () => {
    (useSelector as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useEmergencyMode());

    expect(result.current.isEmergencyMode).toBe(true);
  });

  it('toggles emergency mode', () => {
    (useSelector as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useEmergencyMode());

    act(() => {
      result.current.toggleEmergencyMode();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'emergency/toggleEmergencyMode',
    });
  });

  it('activates emergency mode', () => {
    (useSelector as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useEmergencyMode());

    act(() => {
      result.current.activateEmergencyMode();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'emergency/setEmergencyMode',
      payload: true,
    });
  });

  it('deactivates emergency mode', () => {
    (useSelector as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useEmergencyMode());

    act(() => {
      result.current.deactivateEmergencyMode();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'emergency/setEmergencyMode',
      payload: false,
    });
  });
});
