export type ApiResponse<TData> = {
	status: string
	message: string
	data: TData | null
}
export type ApiResponseError<TError> = {
	status: string
	message: string
	error: TError | null
}
export type ServicesResponse<TData> = Omit<
	ApiResponse<TData>,
	'status' | 'message'
> & {
	status: number
}
export type StatusCode = '200' | '201' | '400' | '401' | '403' | '404' | '500'
export type StatusText =
	| 'OK'
	| 'CREATED'
	| 'BAD REQUEST'
	| 'UNAUTHORIZE'
	| 'FORBIDEN'
	| 'NOT FOUND'
	| 'SERVER ERROR'
export type StatusCodeMap = {
	[key in StatusCode]: { text: StatusText }
}
