# storybook-addon-playwright

An addon to visually test the stories in the multiple browsers within storybook environment.

> Addon will not work in storybook static build, but the screenshots can be tested against the static build files.

> This package has been tested with react framework only, therefore it may not work with other frameworks.

![addon-screenshot](assets/addon-screenshot.gif)

## Motivation

Being able to make components that feel and look same in all browser were always a challenge, it's required that developer keep switching between browsers and visually checking the components. It's also important to keep track of the changes and be able to detect changes as quickly as possible. That's why this add-on has been created. With the help of playwright and storybook now it's possible to visually check components and be notified of changes all in one place.

## Getting Started

Required packages:

- storybook-addon-playwright
- playwright-core
- @storybook/addon-knobs

```js
yarn add playwright playwright-core storybook-addon-playwright @storybook/addon-knobs --dev
```

The `playwright` package is not required if [docker](https://github.com/ccpu/playwright-docker-server) has been configured to communicate with the playwright browsers.

## Configuration

within `.storybook/main.js`

```js
module.exports = {
  stories: ['../**/*.stories.[tj]sx'],
  addons: [
    '@storybook/addon-knobs/register',
    'storybook-addon-playwright/register',
  ],
};
```

<div>
<div><span style="color: #ff0000;font-size:18px"><strong>Important Note</strong></span></div>
<div> </div>
<div><span style="color: #ff0000;font-size:16px">For addon to be able to save the files next to the story, its important to not having the folder name in the matcher string, for example having this matcher <strong>['../src/**/*.stories.[tj]s']</strong> will cause addon to save the files in a different place. and causing confusion.</span></div>
</div>

within `.storybook/main.js` OR `.storybook/middleware.js`:

```js
const { setConfig } = require('storybook-addon-playwright/configs');
const playwright = require('playwright');

(async () => {
  let browser = {
    chromium: await playwright['chromium'].launch(),
    firefox: await playwright['firefox'].launch(),
    webkit: await playwright['webkit'].launch(),
  };
  setConfig({
    storybookEndpoint: `http://localhost:6006/`,
    getPage: async (browserType, device) => {
      const context = await browser[browserType].newContext({ ...device });
      const page = await context.newPage();
      return page;
    },
    afterScreenshot: async (page) => {
      await page.close();
    },
  });
})();
```

within .storybook/middleware.js:

```js
const middleware = require('storybook-addon-playwright/middleware');
module.exports = middleware;
```

## How it works

This add-on is basically an interface between playwright and storybook stories.
Add-on executes user instruction on the page provided in configuration file. It will save the user instruction in a json file saved next to the story file.

This add-on consist of there parts:

- Action list panel
- Screenshots list panel
- Screenshots preview panel

### Action list panel:

Action panel act like a playground, it consists of the list of action sets that created by user for specific story and will be executed in the browser page when selected.

An action set can have single or multiple actions.

Actions are referred to the playwright page methods such as click, mouse move etc...

### Screenshots list panel

This panel holds the screenshots taken previously by user, here you can manage screenshots such as delete edit or sort screenshots.

### Screenshots preview panel

The preview panel displays the latest screenshots taken by the playwright, it can selectively display all or some of the supported browser by playwright.

Here you can save and change the screenshots settings such as with, height etc.

The screenshots are saved in the folder named `__screenshots__` under the story folder.

## Testing

Screenshots saved with the addon can also be tested with the test framework like jest. to do so configure the jest as follow:

add setup file to jest.config.js

```js
module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
};
```

within jest.setup.js

```js
const playwright = require('playwright');
const { setConfig } = require('storybook-addon-playwright/configs');
const { toMatchScreenshots } = require('storybook-addon-playwright');

expect.extend({ toMatchScreenshots });

let browsers = {};

beforeAll(async () => {
  browsers = {
    chromium: await playwright['chromium'].launch(),
    firefox: await playwright['firefox'].launch(),
    webkit: await playwright['webkit'].launch(),
  };
  setConfig({
    storybookEndpoint: `http://localhost:6006/`, // or  `./storybook-static`
    getPage: async (browserType, device) => {
      const context = await browsers[browserType].newContext({ ...device });
      const page = await context.newPage();
      return page;
    },
    afterScreenshot: async (page) => {
      await page.close();
    },
  });
});

afterAll(async () => {
  const promises = Object.keys(browsers).map((browser) =>
    browsers[browser].close(),
  );
  await Promise.resolve(promises);
});
```

and within the test file:

```js
describe('test screenshots', () => {
  it('should pass image diff', async () => {
    await expect('*').toMatchScreenshots();
  }, 10000);
});
```

Or with `toMatchImageSnapshot`:

```js
const { getScreenshots } = require('storybook-addon-playwright');

describe('test screenshots manually', () => {
  it('should pass image diff', async () => {
    await getScreenshots({
      onScreenshotReady: (screenshotBuffer, baselineScreenshotPath) => {
        expect(screenshotBuffer).toMatchImageSnapshot({
          customSnapshotIdentifier: baselineScreenshotPath.screenshotIdentifier,
          customSnapshotsDir: baselineScreenshotPath.screenshotsDir,
        });
      },
    });
  }, 10000);
});
```

> Make sure to set appropriate timeout for your tests.

## Typescript

If your editor does not recognise the `toMatchScreenshots` matcher, add a global.d.ts file to your project with:

```js
import 'storybook-addon-playwright';
```
