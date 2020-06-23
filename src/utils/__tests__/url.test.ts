import { constructStoryUrl } from '../construct-story-url';
import { KnobStoreKnob } from '../../typings';

describe('constructStoryUrl', () => {
  it('should to have valid url', () => {
    const url = constructStoryUrl('localhost:6006', 'my-story');
    expect(url).toBe('http://localhost:6006/iframe.html?id=my-story');
  });
  it('should have knobs', () => {
    const knobs: KnobStoreKnob[] = [
      { name: 'props-a', value: 1 } as KnobStoreKnob,
    ];
    const url = constructStoryUrl('localhost:6006', 'my-story', knobs);
    expect(url).toBe(
      'http://localhost:6006/iframe.html?id=my-story&knob-props-a=1',
    );
  });
});
