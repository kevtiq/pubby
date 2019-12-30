import pubbel from '../pubbel';

const testFn = jest.fn((x) => x);
const asyncTestFn = jest.fn().mockResolvedValue('default');

describe('default pubbel', () => {
  let pubsub;
  beforeEach(() => {
    pubsub = pubbel();
    pubsub.subscribe('test-event', testFn);
    pubsub.subscribe('test-event', testFn);
  });

  afterEach(() => {
    pubsub.remove('test-event');
  });

  it('ID', () => {
    expect(pubsub.id.length).toBe(5);
  });

  it('not Called', () => {
    pubsub.publish('not-event');
    expect(testFn.mock.calls.length).toBe(0);
  });

  it('called', () => {
    pubsub.publish('test-event');
    expect(testFn.mock.calls.length).toBe(2);
  });

  it('has', () => {
    expect(pubsub.has('test-event')).toBe(true);
    expect(pubsub.has('no-event')).toBe(false);
  });

  it('faulty subscribe', () => {
    pubsub.subscribe('test-event');
    pubsub.publish('test-event');
    expect(testFn.mock.calls.length).toBe(4);
  });

  it('unsubscribe', () => {
    const subscription = pubsub.subscribe('unsubscribe', testFn);
    expect(pubsub.has('unsubscribe')).toBe(true);
    pubsub.unsubscribe('unsubscribe', subscription);
    expect(pubsub.has('unsubscribe')).toBe(false);
  });

  it('Another subscribe & unsubscribe', () => {
    const subscription = pubsub.subscribe('test-event', testFn);
    pubsub.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(7);
    pubsub.unsubscribe('test-event', subscription);
    pubsub.unsubscribe('test-event', { index: 4 });
    pubsub.unsubscribe('tesevent', { index: 4 });
    pubsub.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(9);
  });

  it('remove topic', () => {
    pubsub.remove('test-event');
    pubsub.publish('test-event', 'test');
    expect(testFn.mock.calls.length).toBe(9);
  });

  it('async cb', () => {
    pubsub.subscribe('test-event', asyncTestFn);
    pubsub.publish('test-event', 'test');
    expect(asyncTestFn.mock.calls.length).toBe(1);
  });
});

describe('sync between tabs', () => {
  const pubsub = pubbel({ sync: true });
  pubsub.subscribe('sync-event', testFn);

  it('simple sync', () => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'pubbel-sync-event'
      })
    );
    expect(testFn.mock.calls.length).toBe(12);
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'pubbel-sync-event-2'
      })
    );
    expect(testFn.mock.calls.length).toBe(12);

    window.dispatchEvent(new StorageEvent('storage', {}));
    expect(testFn.mock.calls.length).toBe(12);
  });

  it('sync with data', () => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'pubbel-sync-event',
        newValue: JSON.stringify({ key: 'value' })
      })
    );
    expect(testFn.mock.calls.length).toBe(13);
  });

  it('send over to other browsers', () => {
    pubsub.publish('sync-event');
  });
});
