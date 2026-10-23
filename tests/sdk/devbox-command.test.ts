import { Runloop } from '../../src';
import { Devbox } from '../../src/sdk/devbox';

describe('Devbox command helpers', () => {
  afterEach(() => jest.restoreAllMocks());

  test('execAsync forwards stdin options with the command', async () => {
    const client = new Runloop({ bearerToken: 'test-token' });
    const execute = jest.spyOn(client.devboxes, 'executeAsync').mockResolvedValue({
      devbox_id: 'dbx_123',
      execution_id: 'exec_123',
      status: 'queued',
    });

    await Devbox.fromId(client, 'dbx_123').cmd.execAsync('cat', { attach_stdin: true });

    expect(execute).toHaveBeenCalledWith('dbx_123', { command: 'cat', attach_stdin: true }, undefined);
  });

  test('logs forwards the execution filter', async () => {
    const client = new Runloop({ bearerToken: 'test-token' });
    const list = jest.spyOn(client.devboxes.logs, 'list').mockResolvedValue({ logs: [] });

    await Devbox.fromId(client, 'dbx_123').logs({ execution_id: 'exec_123' });

    expect(list).toHaveBeenCalledWith('dbx_123', { execution_id: 'exec_123' }, undefined);
  });
});
