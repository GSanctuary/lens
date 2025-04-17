import { Fetch } from './Fetch';

@component
export class WebRequest extends BaseScriptComponent {
  @input remoteServiceModule: RemoteServiceModule;

  public makeAPICall(b: boolean) {
    new Fetch(this.remoteServiceModule)
      .method(RemoteServiceHttpRequest.HttpRequestMethod.Get)
      .url('https://catfact.ninja/fact')
      .body({})
      .perform(this.handler);
  }

  handler: (response: RemoteServiceHttpResponse) => void = (response) => {
    print(`HTTP CODE ${response.statusCode}`);
    print(`Content-Type: ${response.contentType}`);
    print(`Headers: ${JSON.stringify(response.headers)}`);
    print(response.body);
  };
}
