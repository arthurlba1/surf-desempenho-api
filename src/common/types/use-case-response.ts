export type IUseCaseResponse<T = unknown> = {
  message: string;
  detail?: T;
}
