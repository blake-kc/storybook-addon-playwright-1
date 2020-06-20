import { MatchImageSnapshotOptions } from 'jest-image-snapshot';
import { getScreenshots } from './get-screenshots';
import path from 'path';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R, T> {
      toMatchScreenshots(options?: MatchImageSnapshotOptions): R;
    }
  }
}

beforeAll(() => {
  expect.extend({ toMatchImageSnapshot });
});

export async function toMatchScreenshots(
  playwrightJsonPath?: string,
  options?: MatchImageSnapshotOptions,
) {
  const { testPath } = this;

  const testDirParsed = path.parse(testPath);
  const testDir = testDirParsed.dir;

  const resolvedPath = path.resolve(path.join(testDir, playwrightJsonPath));

  const configRelative = path
    .relative(process.cwd(), resolvedPath)
    .replace(/\\/g, '/');

  try {
    await getScreenshots({
      onScreenshotReady: (screenshotBuffer, baselineScreenshotPath) => {
        try {
          expect(screenshotBuffer).toMatchImageSnapshot({
            ...options,
            customSnapshotIdentifier:
              baselineScreenshotPath.screenshotIdentifier,
            customSnapshotsDir: baselineScreenshotPath.screenshotsDir,
          });
        } catch (error) {
          throw error.message;
        }
      },
      playwrightJsonPath:
        playwrightJsonPath === '*' ? playwrightJsonPath : configRelative,
    });
  } catch (error) {
    return {
      message: () => error,
      pass: false,
    };
  }
  return {
    message: () => 'expected page screenshot to match.',
    pass: true,
  };
}
