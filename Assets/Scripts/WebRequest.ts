@component
export class WebRequest extends BaseScriptComponent {
  @input remoteServiceModule: RemoteServiceModule;

  async onAwake() {
    let request = new Request(
      'https://0bb4-205-175-97-141.ngrok-free.app/test',
      {
        method: 'GET',
      }
    );
    let response = await this.remoteServiceModule.fetch(request);
    print(response.status);
    if (response.status == 200) {
      let text = await response.text();
      print(`Response: ${text}`);
    }
  }

  handler: (response: RemoteServiceHttpResponse) => void = (response) => {
    print(`HTTP CODE ${response.statusCode}`);
    print(`Content-Type: ${response.contentType}`);
    print(`Headers: ${JSON.stringify(response.headers)}`);
    print(response.body);
  };
}
