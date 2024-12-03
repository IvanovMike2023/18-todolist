import { instance } from "common/instance"
import { BaseResponse } from "common/types"
import { DomainTask, GetTasksResponse, UpdateTaskModel } from "./tasksApi.types"
import {baseApi} from "../../../app/baseApi";
import {DomainTodolist} from "../model/todolistsSlice";
import {Todolist} from "./todolistsApi.types";
import {todolistsApi} from "./_todolistsApi";

export const _tasksApi = {
  getTasks(todolistId: string) {
    return instance.get<GetTasksResponse>(`todo-lists/${todolistId}/tasks`)
  },
  createTask(payload: { title: string; todolistId: string }) {
    const { title, todolistId } = payload
    return instance.post<BaseResponse<{ item: DomainTask }>>(`todo-lists/${todolistId}/tasks`, { title })
  },
  deleteTask(payload: { todolistId: string; taskId: string }) {
    const { taskId, todolistId } = payload
    return instance.delete<BaseResponse>(`todo-lists/${todolistId}/tasks/${taskId}`)
  },
  updateTask(payload: { todolistId: string; taskId: string; model: UpdateTaskModel }) {
    const { taskId, todolistId, model } = payload
    return instance.put<BaseResponse<{ item: DomainTask }>>(`todo-lists/${todolistId}/tasks/${taskId}`, model)
  },
}
export const tasksApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getTasks: build.query<GetTasksResponse, string>({
      query: (todolistId) => `todo-lists/${todolistId}/tasks`,

      providesTags: ['Task'],
    }),
    createTask: build.mutation<BaseResponse<{ item: DomainTask }>,{ title: string; todolistId: string }>({
      query: ({title, todolistId}) => {
        return {
          url: `todo-lists/${todolistId}/tasks`,
          method: 'POST',
          body: {title}
        }
      },
      invalidatesTags: ['Task']
    }),
    updateTask: build.mutation<BaseResponse<{ item: DomainTask }>,{ todolistId: string; taskId: string; model: UpdateTaskModel }>({
      query: ({ taskId, todolistId, model }) => {
       // debugger
        console.log(model)
        return {
          url: `todo-lists/${todolistId}/tasks/${taskId}`,
          method: 'PUT',
          body: model
        }
      },
      invalidatesTags: ['Task']
    }),
    DeleteTask: build.mutation<BaseResponse,{ taskId: string; todolistId: string }>({
      query: ({taskId, todolistId}) => {
        return {
          url: `todo-lists/${todolistId}/tasks/${taskId}`,
          method: 'DELETE'
        }
      },
      invalidatesTags: ['Task']
    })
  }),
})

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} = tasksApi