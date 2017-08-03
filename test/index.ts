import { Test, run, test } from 'beater';
import * as assert from 'power-assert';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import { SimpleGistClient as Client } from '../src';

const fixture = (fn: (context: any) => any): Function => {
  return () => Promise.resolve()
    .then(() => {
      const context: any = {};
      context.sinon = sinon.sandbox.create();
      context.fetch = context.sinon.stub();
      context.SimpleGistClient = proxyquire('../src', {
        'node-fetch': {
          default: context.fetch
        }
      }).SimpleGistClient;
      return context;
    })
    .then((context) => fn(context).then((r: any) => {
      context.sinon.restore();
      return Promise.resolve(r);
    }, (e: any) => {
      context.sinon.restore();
      return Promise.reject(e);
    }));
};

const tests1: Test[] = [
  test('create', fixture((context: any) => {
    const fetch: sinon.SinonStub = context.fetch;
    const SimpleGistClient: typeof Client = context.SimpleGistClient;

    const id = 'abc';
    const response = Promise.resolve({
      status: 201,
      json: () => Promise.resolve<any>({ id })
    });
    fetch.returns(response);

    const token = '123';
    const data = 456;
    const client = new SimpleGistClient({ token });
    return client.create(data).then(result => {
      assert(fetch.callCount === 1);
      const args = fetch.getCall(0).args;
      assert(args[0] === 'https://api.github.com/gists');
      assert(args[1]['method'] === 'POST');
      assert(
        args[1]['body'] === JSON.stringify({
          files: {
            'data.json': {
              content: JSON.stringify({ data: 456 })
            }
          },
          public: false
        })
      );
      assert(args[1]['headers']['Accept'] === 'application/vnd.github.v3+json');
      assert(args[1]['headers']['Authorization'] === `token ${token}`);
      assert(result === id);
    });
  })),

  test('delete', fixture((context: any) => {
    const fetch: sinon.SinonStub = context.fetch;
    const SimpleGistClient: typeof Client = context.SimpleGistClient;

    const response = Promise.resolve({
      status: 204,
      json: () => Promise.reject(new Error())
    });
    fetch.returns(response);

    const token = '123';
    const id = 'abc';
    const client = new SimpleGistClient({ token });
    return client.delete(id).then(result => {
      assert(fetch.callCount === 1);
      const args = fetch.getCall(0).args;
      assert(args[0] === 'https://api.github.com/gists/abc');
      assert(args[1]['method'] === 'DELETE');
      assert(args[1]['headers']['Accept'] === 'application/vnd.github.v3+json');
      assert(args[1]['headers']['Authorization'] === `token ${token}`);
      assert(result === undefined);
    });
  })),

  test('read', fixture((context: any) => {
    const fetch: sinon.SinonStub = context.fetch;
    const SimpleGistClient: typeof Client = context.SimpleGistClient;

    const id = 'abc';
    const data = 456;
    const response = Promise.resolve({
      status: 200,
      json: () => Promise.resolve<any>({
        id,
        files: {
          'data.json': {
            content: JSON.stringify({ data })
          }
        }
      })
    });
    fetch.returns(response);

    const token = '123';
    const client = new SimpleGistClient({ token });
    return client.read(id).then(result => {
      assert(fetch.callCount === 1);
      const args = fetch.getCall(0).args;
      assert(args[0] === 'https://api.github.com/gists/abc');
      assert(args[1]['method'] === 'GET');
      assert(args[1]['headers']['Accept'] === 'application/vnd.github.v3+json');
      assert(args[1]['headers']['Authorization'] === `token ${token}`);
      assert(result === data);
    });
  })),

  test('update', fixture((context: any) => {
    const fetch: sinon.SinonStub = context.fetch;
    const SimpleGistClient: typeof Client = context.SimpleGistClient;

    const id = 'abc';
    const data = 789;
    const response = Promise.resolve({
      status: 200,
      json: () => Promise.resolve<any>({
        id, data: JSON.stringify({ data })
      })
    });
    fetch.returns(response);

    const token = '123';
    const client = new SimpleGistClient({ token });
    return client.update(id, data).then(result => {
      assert(fetch.callCount === 1);
      const args = fetch.getCall(0).args;
      assert(args[0] === 'https://api.github.com/gists/abc');
      assert(args[1]['method'] === 'PATCH');
      assert(
        args[1]['body'] === JSON.stringify({
          files: {
            'data.json': {
              content: JSON.stringify({ data })
            }
          }
        })
      );
      assert(args[1]['headers']['Accept'] === 'application/vnd.github.v3+json');
      assert(args[1]['headers']['Authorization'] === `token ${token}`);
      assert(result === undefined);
    });
  }))
];

run(tests1).catch(() => process.exit(1));
