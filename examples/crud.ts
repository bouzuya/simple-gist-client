import { SimpleGistClient } from '../src/';

const token = process.env.GITHUB_TOKEN; // See: _envrc

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

