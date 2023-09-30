export class Res {
  ok(message: string = "success") {
    return { message: message };
  }
}