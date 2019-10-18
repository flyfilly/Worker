const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

interface constructorArgs {
  /**
   *  The "args" object is used to specify the arguments required for the execute function.
   *  { name : value }
   */
  args: Object;
  /**
   *  The "execute" function is what is to be executed in the web worker.
   *  @param {any} n specify as many named parameters to match the "args" object. This is purely
   *  to ensure not typescript errors will be encountered.
   */
  execute: Function;
  /**
   *  The "after" function how the results of the execute function should be handled in the context of the worker's use.
   *  @param {MessageEvent} ev the event emitted back from the web worker.
   */
  after: Function;
}

/**
 *  Class WebWorker creates and executes a web worker thread without creating
 *  a worker file to execute the web worker functionality
 */
export class WebWorker {
  private dynamicWorker: Worker;
  private args: Object;
  private execute: Function;
  private after: Function;

  /**
   * Construct a new WebWorker object
   * @param {Function} execute The functionality to be executed in the worker thread.
   * @param {Object} args The arguments mapped from the execute function.
   * @param {Function} after The functionality to handle the executed web worker function.
   */
  constructor({ execute, args, after }: constructorArgs) {
    this.args = args;
    this.execute = execute;
    this.after = after;

    this.dynamicWorker = new Worker(
      window.URL.createObjectURL(
        new Blob(['(', this.executeFunc(), ')()'], {
          type: 'text/javascript',
        }),
      ),
    );

    this.dynamicWorker.onmessage = function(this: Worker, ev: MessageEvent) {
      this.postMessage(ev);
    };

    this.dynamicWorker.postMessage = function(ev: MessageEvent) {
      after(ev);
      this.terminate();
    };
  }

  private executeFunc(): string {
    const funcString = this.execute.toString();
    const body = funcString.substring(funcString.indexOf('{') + 1, funcString.lastIndexOf('}'));
    let argsString = '';

    for (let arg in this.args) {
      // @ts-ignore ''
      let val = this.args[arg];
      switch (typeof val) {
        case 'string':
          argsString += `${arg} = "${val}", `;
          break;
        case 'object':
          argsString += `${arg} = ${JSON.stringify(val)}, `;
          break;
        default:
          argsString += `${arg} = ${val}, `;
      }
    }
    const fn = new AsyncFunction(argsString, body).toString();
    return fn;
  }
}
