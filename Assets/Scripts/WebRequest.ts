@component
export class WebRequest extends BaseScriptComponent {
  @input remoteServiceModule: RemoteServiceModule;

  public makeAPICall(b: boolean) {
    const request = RemoteServiceHttpRequest.create();
    request.method = RemoteServiceHttpRequest.HttpRequestMethod.Get;
    request.url = 'https://catfact.ninja/fact';

    print(request.url);

    this.remoteServiceModule.performHttpRequest(request, (response) => {
      print(`HTTP CODE ${response.statusCode}`);
      print(`Content-Type: ${response.contentType}`);
      print(`Headers: ${JSON.stringify(response.headers)}`);
      print(response.body);
      print(request.url);
    });
  }
}
