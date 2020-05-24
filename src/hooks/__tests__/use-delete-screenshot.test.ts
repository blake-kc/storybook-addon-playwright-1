import { dispatchMock } from '../../../__manual_mocks__/store/screenshot/context';
import { useDeleteScreenshot } from '../use-delete-screenshot';
import { renderHook, act } from '@testing-library/react-hooks';
import fetch from 'jest-fetch-mock';

// const deleteScreenshotMock = jest.fn();

// jest.mock('../api/client', () => ({
//   deleteScreenshot: deleteScreenshotMock,
// }));

// deleteScreenshotMock.mockImplementationOnce(() => {
//   return new Promise((resolve) => {
//     resolve();
//   });
// });

describe('useDeleteScreenshot', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not have value for error and loading', () => {
    const { result } = renderHook(() => useDeleteScreenshot());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(undefined);
  });

  it('should call for delete', async () => {
    fetch.mockResponseOnce(JSON.stringify('{success:true}'));
    const { result } = renderHook(() => useDeleteScreenshot());

    await act(async () => {
      await result.current.deleteScreenshot('hash');
    });

    expect(dispatchMock).toHaveBeenCalledWith([
      { screenshotHash: 'hash', type: 'deleteScreenshot' },
    ]);
  });

  it('should have error', async () => {
    fetch.mockRejectOnce(new Error('foo'));
    const { result } = renderHook(() => useDeleteScreenshot());

    await act(async () => {
      await result.current.deleteScreenshot('hash');
    });

    expect(result.current.error).toBe('foo');
  });
});
