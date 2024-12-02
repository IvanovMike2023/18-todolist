import { instance } from "common/instance"
import { BaseResponse } from "common/types"
import { LoginArgs } from "./authAPI.types"
import {baseApi} from "../../../app/baseApi";
import {DomainTodolist} from "../../todolists/model/todolistsSlice";
import {Todolist} from "../../todolists/api/todolistsApi.types";

export const _authApi = {
  login(payload: LoginArgs) {
    return instance.post<BaseResponse<{ userId: number; token: string }>>(`auth/login`, payload)
  },
  logout() {
    return instance.delete<BaseResponse>("auth/login")
  },
  me() {
    return instance.get<BaseResponse<{ id: number; email: string; login: string }>>("auth/me")
  },
}
export const authApi = baseApi.injectEndpoints({
  endpoints: build => ({
    me: build.query<BaseResponse<{ id: number; email: string; login: string }>, void>({
      query: () => 'auth/me',
     // providesTags: ['Auth'],
    }),
    login: build.mutation<BaseResponse<{ userId: number; token: string }>, LoginArgs >({
      query: (payload) => {
        return {
          url: 'auth/login',
          method: 'POST',
          body: {payload}
        }
      },
     // invalidatesTags: ['Auth']
    }),
    logout: build.mutation<BaseResponse, void>({
      query: () => {
        return {
          url: `auth/login`,
          method: 'DELETE'
        }
      },
     // invalidatesTags: ['Auth']
    })
  }),
})

export const {
  useMeQuery,
  useLoginMutation,
  useLogoutMutation
} = authApi