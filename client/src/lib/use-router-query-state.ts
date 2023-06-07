import { useRouter } from "next/router"
import { Dispatch, SetStateAction, useState } from "react"
import { useWatch } from "./use-watch"
import { options } from "@fullcalendar/core/preact"

type SerializerFunction = (value: any) => string | undefined
type DeserializerFunction = (value: string) => any

interface Options {
  serializer?: SerializerFunction
  deserializer?: DeserializerFunction
  isNumber?: boolean
}

// https://dev.to/jeffsalive/solving-the-challenge-of-state-persistence-in-nextjs-effortless-state-management-with-query-parameters-4a6p
export function useRouterQueryState<T>(
  name: string,
  defaultValue?: T,
  opts: Options = {}
): [T, Dispatch<SetStateAction<T>>] {
  const router = useRouter()

  const serialize = (value: T): string | undefined => {
    if (opts.serializer) {
      try {
        return opts.serializer(value)
      } catch (e) {
        return undefined
      }
    }
    return value as string
  }

  const deserialize = (value: string): T => {
    if (opts.deserializer) {
      try {
        return opts.deserializer(value)
      } catch (e) {
        return defaultValue as T
      }
    }

    // default deserializer for number type
    if (opts.isNumber || typeof defaultValue === "number") {
      const numValue = Number(value === "" ? "r" : value)
      return isNaN(numValue) ? (defaultValue as T) : (numValue as T)
    }
    return value as T
  }

  const [state, setState] = useState<T>(() => {
    const value = router.query[name]
    if (value === undefined) {
      return defaultValue as T
    }
    return deserialize(value as string)
  })

  useWatch(() => {
    //! Don't manipulate the query parameter directly
    const serializedState = serialize(state)
    const _q = router.query

    if (serializedState === undefined) {
      if (router.query[name]) {
        delete _q[name]
        router.query = _q
      }
    } else {
      _q[name] = serializedState
      router.query = _q
    }
    router.push(
      {
        pathname: window.location.pathname,
        query: {
          ..._q,
          [name]: router.query[name],
        },
        hash: window.location.hash,
      },
      undefined,
      { shallow: true }
    )
  }, [state, name])

  return [state, setState]
}
