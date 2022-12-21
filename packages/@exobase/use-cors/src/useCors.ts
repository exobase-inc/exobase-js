import type { Handler, Props } from '@exobase/core'
import { response } from '@exobase/core'
import { tryit } from 'radash'

export const DEFAULT_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers':
    'X-CSRF-Token, X-Requested-With, Authorization, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
}

export async function withCors<TProps extends Props>(
  func: Handler<TProps>,
  headers: Partial<typeof DEFAULT_CORS_HEADERS> | undefined,
  props: TProps
) {
  const headersToApply = {
    ...DEFAULT_CORS_HEADERS,
    ...(headers ?? {})
  }
  if (props.request.method.toLowerCase() === 'options') {
    return {
      ...props.response,
      headers: {
        ...props.response.headers,
        ...headersToApply
      }
    }
  }
  const [err, result] = await tryit(func)(props)
  const r = response(err, result)
  return {
    ...r,
    headers: {
      ...r.headers,
      ...headersToApply
    }
  }
}

export const useCors: <TProps extends Props>(
  headers?: Partial<typeof DEFAULT_CORS_HEADERS>
) => (func: Handler<TProps>) => Handler<TProps> = headers => func => props =>
  withCors(func, headers, props)
