import * as fetch from 'node-fetch';

export type GistId = string;

// - Manage API token
// - Provide CRUD for Gist
export class SimpleGistClient {
  private static _baseUrl = 'https://api.github.com';
  private static _dataFileName = 'data.json';
  private _token: string;

  constructor({ token }: { token: string; }) {
    if (!token) throw new Error('token is not defined');
    this._token = token;
  }

  create<T>(data: T): Promise<GistId> {
    const path = '/gists';
    const files: { [fileName: string]: { content: string; }; } = {};
    files[SimpleGistClient._dataFileName] = {
      content: this._serialize(data)
    };
    const options = {
      method: 'POST',
      body: JSON.stringify({
        files,
        public: false
      })
    };
    return this._fetch(path, options).then(({ body }) => {
      return body.id;
    });
  }

  delete(id: GistId): Promise<void> {
    const path = `/gists/${id}`;
    const options = { method: 'DELETE' };
    return this._fetch(path, options).then(() => void 0);
  }

  read<T>(id: GistId): Promise<T> {
    const path = `/gists/${id}`;
    const options = { method: 'GET' };
    return this._fetch(path, options).then(({ body }) => {
      const content = body.files[SimpleGistClient._dataFileName].content;
      return this._deserialize(content);
    });
  }

  update<T>(id: GistId, data: T): Promise<void> {
    const path = `/gists/${id}`;
    const files: { [fileName: string]: { content: string; }; } = {};
    files[SimpleGistClient._dataFileName] = {
      content: this._serialize(data)
    };
    const options = {
      method: 'PATCH',
      body: JSON.stringify({ files })
    };
    return this._fetch(path, options).then(() => void 0);
  }

  private _deserialize<T>(content: string): T {
    return JSON.parse(content).data;
  }

  private _fetch(
    path: string,
    options: any
  ): Promise<{ response: any; body: any; }> {
    const url = SimpleGistClient._baseUrl + path;
    const optionsWithHeaders = Object.assign({}, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': 'token ' + this._token
      }
    }, options);
    return fetch(url, optionsWithHeaders).then((response: any) => {
      const { status } = response;
      const body = status === 204 ? Promise.resolve(void 0) : response.json();
      return body.then((body: any) => {
        if (status < 200 || 299 < status) {
          throw new Error(`${status}: ${body.message}`);
        }
        return { response, body };
      });
    });
  }

  private _serialize<T>(data: T): string {
    return JSON.stringify({ data });
  }
}
