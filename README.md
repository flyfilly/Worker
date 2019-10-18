# Worker

typescript library that dynamically creates and executes processes in a web worker.

## Example Usage:

```javascript
import { WebWorker } from '@/plugins/worker/worker';

const execute = (url: string, body: Object) => {
  const response = fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((json) => {
      // @ts-ignore ''
      postMessage(json);
    });
};

const args = {
  url: this.url,
  body: this.body,
};

const after = (e: MessageEvent) => {
  store.dispatch('updateResponse', e.data.json.one);
};

const worker = new WebWorker({
  execute,
  args,
  after,
});
```
