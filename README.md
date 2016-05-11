# simple-gist-client

A simple client for Gist.

## Installation

```
$ npm install simple-gist-client
```

## Usage

```ts
import { SimpleGistClient } from 'simple-gist-client';

const token = 'YOUR GITHUB TOKEN';

const data = 456;
const client = new SimpleGistClient({ token });
client
  .create(data)
  .then(id => {
    console.log(`created : https://gist.github.com/${id}`);
    return client.read(id)
      .then(data => {
        console.log(`read : ${data}`); // read : 456
        return client.update(id, 789);
      })
      .then(() => {
        console.log('updated');
        return client.read(id);
      })
      .then(data => {
        console.log(`read : ${data}`); // read : 789
        return client.delete(id);
      })
      .then(() => {
        console.log('deleted');
      });
  })
  .catch(error => {
    console.error(error);
  });
```

See: [examples/](examples/)

## Badges

[![Circle CI][circleci-badge-url]][circleci-url]

## License

[MIT](LICENSE)

## Author

[bouzuya][user] &lt;[m@bouzuya.net][email]&gt; ([http://bouzuya.net][url])

[user]: https://github.com/bouzuya
[email]: mailto:m@bouzuya.net
[url]: http://bouzuya.net
[circleci-badge-url]: https://circleci.com/gh/bouzuya/simple-gist-client.svg?style=svg
[circleci-url]: https://circleci.com/gh/bouzuya/simple-gist-client
