/**
 * Standard API response format
 */
export class ApiResponse<T = any> {
  constructor(
    public success: boolean,
    public data?: T,
    public error?: string,
    public meta?: any,
  ) {}

  static success<T>(data: T, meta?: any) {
    return new ApiResponse(true, data, undefined, meta);
  }

  static error(error: string) {
    return new ApiResponse(false, undefined, error);
  }
}
