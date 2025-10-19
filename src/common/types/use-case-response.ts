export type IUseCaseResponse<T = unknown> = {
  message: string;
  data?: T;
}
