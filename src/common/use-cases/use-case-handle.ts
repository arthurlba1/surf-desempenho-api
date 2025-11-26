import { IUseCaseResponse } from "@/common/types/use-case-response"
import type { AuthUser } from "@/common/types/auth.types";

interface IUseCase<TInput = any, TOutput = any> {
  handle(payload: TInput, auth?: any): Promise<IUseCaseResponse<TOutput>>;
}

export abstract class BaseUseCase<TInput = any, TOutput = any>
  implements IUseCase<TInput, TOutput>
{
  abstract handle(payload: TInput, auth?: AuthUser): Promise<IUseCaseResponse<TOutput>>;

  protected ok<T>(message: string, data?: T): IUseCaseResponse<T> {
    return { message, detail: data };
  }
}
