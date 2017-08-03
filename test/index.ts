import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import { SimpleGistClient as Client } from '../src/';

test.beforeEach(t => {
  t.context.sinon = sinon.sandbox.create();
  t.context.fetch = t.context.sinon.stub();
  t.context.SimpleGistClient = proxyquire('../src/', {
    'node-fetch': t.context.fetch
  }).SimpleGistClient;
});

test.afterEach(t => {
  t.context.sinon.restore();
});

test('create', t => {
  t.plan(7);

  const fetch: sinon.SinonStub = t.context.fetch;
  const SimpleGistClient: typeof Client = t.context.SimpleGistClient;

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
    t.true(fetch.callCount === 1);
    const args = fetch.getCall(0).args;
    t.true(args[0] === 'https://api.github.com/gists');
    t.true(args[1]['method'] === 'POST');
    t.true(
      args[1]['body'] === JSON.stringify({
        files: {
          'data.json': {
            content: JSON.stringify({ data: 456 })
          }
        },
        public: false
      })
    );
    t.true(args[1]['headers']['Accept'] === 'application/vnd.github.v3+json');
    t.true(args[1]['headers']['Authorization'] === `token ${token}`);
    t.true(result === id);
  });
});

test('delete', t => {
  t.plan(6);

  const fetch: sinon.SinonStub = t.context.fetch;
  const SimpleGistClient: typeof Client = t.context.SimpleGistClient;

  const response = Promise.resolve({
    status: 204,
    json: () => Promise.reject(new Error())
  });
  fetch.returns(response);

  const token = '123';
  const id = 'abc';
  const client = new SimpleGistClient({ token });
  return client.delete(id).then(result => {
    t.true(fetch.callCount === 1);
    const args = fetch.getCall(0).args;
    t.true(args[0] === 'https://api.github.com/gists/abc');
    t.true(args[1]['method'] === 'DELETE');
    t.true(args[1]['headers']['Accept'] === 'application/vnd.github.v3+json');
    t.true(args[1]['headers']['Authorization'] === `token ${token}`);
    t.true(result === undefined);
  });
});

test('read', t => {
  t.plan(6);

  const fetch: sinon.SinonStub = t.context.fetch;
  const SimpleGistClient: typeof Client = t.context.SimpleGistClient;

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
    t.true(fetch.callCount === 1);
    const args = fetch.getCall(0).args;
    t.true(args[0] === 'https://api.github.com/gists/abc');
    t.true(args[1]['method'] === 'GET');
    t.true(args[1]['headers']['Accept'] === 'application/vnd.github.v3+json');
    t.true(args[1]['headers']['Authorization'] === `token ${token}`);
    t.true(result === data);
  });
});

test('update', t => {
  t.plan(7);

  const fetch: sinon.SinonStub = t.context.fetch;
  const SimpleGistClient: typeof Client = t.context.SimpleGistClient;

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
    t.true(fetch.callCount === 1);
    const args = fetch.getCall(0).args;
    t.true(args[0] === 'https://api.github.com/gists/abc');
    t.true(args[1]['method'] === 'PATCH');
    t.true(
      args[1]['body'] === JSON.stringify({
        files: {
          'data.json': {
            content: JSON.stringify({ data })
          }
        }
      })
    );
    t.true(args[1]['headers']['Accept'] === 'application/vnd.github.v3+json');
    t.true(args[1]['headers']['Authorization'] === `token ${token}`);
    t.true(result === undefined);
  });
});
